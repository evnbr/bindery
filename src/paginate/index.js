import h from 'hyperscript';

// Utils
import elToStr from '../utils/elementToString';
import c from '../utils/prefixClass';
import { scrollPct, scrollToBottom } from '../utils/scrollElement';
import { last } from '../utils';

// Bindery
import Book from '../Book';
import Page from '../Page';

// paginate
import Scheduler from './Scheduler';
import orderPages from './orderPages';
import annotatePages from './annotatePages';
import breadcrumbCloner from './breadcrumbCloner';

const MAXIMUM_PAGE_LIMIT = 9999;

const paginate = ({ content, rules, success, progress, error, isDebugging }) => {
  // SETUP
  const start = window.performance.now();
  const state = {
    breadcrumb: [], // Stack representing which element we're currently inside
    pages: [],
    book: new Book(),
  };
  const scheduler = new Scheduler(isDebugging);
  const measureArea = document.body.appendChild(h(c('.measure-area')));

  const cloneBreadcrumb = breadcrumbCloner(rules);

  const applyNewPageRules = (pg) => {
    rules.forEach((rule) => {
      if (rule.afterPageCreated) rule.afterPageCreated(pg, state);
    });
  };

  const makeNewPage = () => {
    const newPage = new Page();
    const shouldScroll = scrollPct(measureArea) > 0.9;
    measureArea.appendChild(newPage.element);
    if (shouldScroll) {
      if (isDebugging) scrollToBottom(measureArea);
      else measureArea.scrollTop = measureArea.scrollHeight;
    }

    applyNewPageRules(newPage);
    return newPage;
  };

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  const continueOnNewPage = () => {
    if (state.currentPage && state.currentPage.hasOverflowed()) {
      console.warn('Bindery: Page overflowing', state.currentPage.element);
      if (!state.currentPage.suppressErrors) {
        throw Error('Bindery: Moved to new page when last one is still overflowing');
      }
    }

    if (state.pages.length === 500) {
      console.warn('Bindery: More than 500 pages, performance may be slow.');
    } else if (state.pages.length === 1000) {
      console.warn('Bindery: More than 1000 pages, performance may be slow.');
    } else if (state.pages.length > MAXIMUM_PAGE_LIMIT) {
      error('Maximum page count exceeded');
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }

    state.breadcrumb = cloneBreadcrumb(state.breadcrumb);
    const newPage = makeNewPage();
    state.pages.push(newPage);
    state.currentPage = newPage;
    if (state.breadcrumb[0]) {
      newPage.flowContent.appendChild(state.breadcrumb[0]);
    }

    // make sure the cloned page is valid.
    if (newPage.hasOverflowed()) {
      const suspect = last(state.breadcrumb);
      if (suspect) {
        console.error(`Bindery: NextPage already overflowing, probably due to a style set on ${elToStr(suspect)}. It may not fit on the page.`);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.error('Bindery: NextPage already overflowing.');
      }
    }

    progress(state.pages.length);

    return newPage;
  };

  const beforeAddRules = rules.filter(r => r.selector && r.beforeAdd);
  const applyBeforeAddRules = (element) => {
    let addedElement = element;
    beforeAddRules.forEach((rule) => {
      if (addedElement.matches(rule.selector)) {
        addedElement = rule.beforeAdd(addedElement, state, continueOnNewPage, makeNewPage);
      }
    });
    return addedElement;
  };

  const afterAddRules = rules.filter(r => r.selector && r.afterAdd);
  const applyAfterAddRules = (originalElement) => {
    let addedElement = originalElement;
    afterAddRules.forEach((rule) => {
      if (addedElement.matches(rule.selector)) {
        addedElement = rule.afterAdd(
          addedElement,
          state,
          continueOnNewPage,
          function overflowCallback(problemElement) {
          // TODO:
          // While this does catch overflows, it introduces a few new bugs.
          // It is pretty aggressive to move the entire node to the next page.
          // - 1. there is no guarentee it will fit on the new page
          // - 2. if it has childNodes, those side effects will not be undone,
          // which means footnotes will get left on previous page.
          // - 3. if it is a large paragraph, it will leave a large gap. the
          // ideal approach would be to only need to invalidate
          // the last line of text.
            problemElement.parentNode.removeChild(problemElement);
            continueOnNewPage();
            const lastEl = last(state.breadcrumb);
            lastEl.appendChild(problemElement);
            return rule.afterAdd(problemElement, state, continueOnNewPage, () => {
              console.log(`Couldn't apply ${rule.name} to ${elToStr(problemElement)}. Caused overflows twice.`);
            });
          }
        );
      }
    });
    return addedElement;
  };
  const afterBindRules = (book) => {
    rules.forEach((rule) => {
      if (rule.afterBind) {
        book.pages.forEach((page) => {
          rule.afterBind(page, book);
        });
      }
    });
  };

  // Walk up the tree to see if we can safely
  // insert a split into this node.
  const selectorsNotToSplit = rules
    .filter(rule => rule.avoidSplit)
    .map(rule => rule.selector);

  const isSplittable = (node) => {
    if (selectorsNotToSplit.some(sel => node.matches(sel))) {
      if (node.hasAttribute('data-bindery-did-move')) {
        return true; // don't split it again.
      }
      if (node.classList.contains(c('continuation'))) {
        return true; // don't split it again.
      }
      return false;
    }
    if (node.parentElement) {
      return isSplittable(node.parentElement);
    }
    return true;
  };


  // TODO: Once a node is moved to a new page, it should
  // no longer trigger another move. otherwise tall elements
  // will trigger endlessly get shifted to the next page
  const moveNodeToNextPage = (nodeToMove) => {
    // So this node won't get cloned. TODO: this is unclear
    state.breadcrumb.pop();

    if (state.breadcrumb.length < 1) {
      throw Error('Bindery: Attempting to move the top-level element is not allowed');
    }

    // find the nearest splittable parent
    let willMove = nodeToMove;
    const pathToRestore = [];
    while (state.breadcrumb.length > 1 && !isSplittable(last(state.breadcrumb))) {
      // console.log('Not OK to split:', last(state.breadcrumb));
      willMove = state.breadcrumb.pop();
      pathToRestore.unshift(willMove);
    }

    // console.log('OK to split:', last(state.breadcrumb));
    // console.log('Will move:', willMove);
    willMove.setAttribute('data-bindery-did-move', true);

    const parent = willMove.parentNode;
    // remove the unsplittable node and subnodes
    parent.removeChild(willMove);

    // Note that this can back all the way up leaving the page empty
    if (state.breadcrumb.length > 1 && last(state.breadcrumb).textContent.trim() === '') {
      parent.appendChild(willMove);
      willMove = state.breadcrumb.pop();
      pathToRestore.unshift(willMove);
      willMove.parentNode.removeChild(willMove);
    }

    if (state.currentPage.isEmpty) {
      // Creating a new page won't help,
      // presumably because this element is too tall.
      // Add it back to the same page.
      nodeToMove.setAttribute('data-bindery-oversized', true);
    } else {
      // create new page and clone context onto it
      if (state.currentPage.hasOverflowed()) {
        state.currentPage.suppressErrors = true;
      }
      continueOnNewPage();
    }


    // append node as first in new page
    if (!state.breadcrumb[0]) {
      console.log('new page has no breadcrumb, adding ', willMove);
      state.currentPage.flowContent.appendChild(willMove);
    } else {
      last(state.breadcrumb).appendChild(willMove);
    }


    // restore subpath
    pathToRestore.forEach((restore) => {
      state.breadcrumb.push(restore);
    });

    // TODO: Confusing. If we didn't pop this node above, we don't
    // need to push it back again.
    state.breadcrumb.push(nodeToMove);
  };

  const addTextNode = (textNode, doneCallback, undoAddTextNode) => {
    last(state.breadcrumb).appendChild(textNode);

    if (state.currentPage.hasOverflowed()) {
      textNode.parentNode.removeChild(textNode);
      undoAddTextNode();
    } else {
      scheduler.throttle(doneCallback);
    }
  };

  // Adds an text node by incrementally adding words
  // until it just barely doesnt overflow
  const addTextNodeIncremental = (originalNode, doneCallback, undoAddTextNode) => {
    let originalText = originalNode.nodeValue;
    let textNode = originalNode;
    last(state.breadcrumb).appendChild(textNode);

    if (!state.currentPage.hasOverflowed()) {
      scheduler.throttle(doneCallback);
      return;
    }
    if (last(state.breadcrumb).hasAttribute('data-bindery-oversized')) {
      scheduler.throttle(doneCallback);
      return;
    }

    let pos = 0;

    const splitTextStep = () => {
      textNode.nodeValue = originalText.substr(0, pos);

      if (state.currentPage.hasOverflowed()) {
        // Back out to word boundary
        if (originalText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
        while (originalText.charAt(pos) !== ' ' && pos > 0) pos -= 1;

        if (pos < 1) {
          textNode.nodeValue = originalText;
          textNode.parentNode.removeChild(textNode);
          undoAddTextNode();
          return;
        }

        const fittingText = originalText.substr(0, pos);
        const overflowingText = originalText.substr(pos);
        textNode.nodeValue = fittingText;
        originalText = overflowingText;

        pos = 0;

        // Start on new page
        continueOnNewPage();

        // Continue working with clone
        textNode = document.createTextNode(originalText);
        last(state.breadcrumb).appendChild(textNode);

        // If the remainder fits there, we're done
        if (!state.currentPage.hasOverflowed()) {
          scheduler.throttle(doneCallback);
          return;
        }

        scheduler.throttle(splitTextStep);
        return;
      }
      if (pos > originalText.length - 1) {
        scheduler.throttle(doneCallback);
        return;
      }

      pos += 1;
      while (originalText.charAt(pos) !== ' ' && pos < originalText.length) pos += 1;

      scheduler.throttle(splitTextStep);
    };

    splitTextStep();
  };

  const addTextChild = (parent, child, next) => {
    const forceAddTextNode = () => {
      last(state.breadcrumb).appendChild(child);
      state.currentPage.suppressErrors = true;
      continueOnNewPage();
      scheduler.throttle(next);
    };

    if (isSplittable(parent)) {
      const undoAddTextNode = () => {
        if (state.breadcrumb.length > 1) {
          moveNodeToNextPage(parent);
          scheduler.throttle(() => addTextNodeIncremental(child, next, forceAddTextNode));
        } else {
          forceAddTextNode();
        }
      };

      addTextNodeIncremental(child, next, undoAddTextNode);
    } else {
      const undoAddTextNode = () => {
        moveNodeToNextPage(parent);
        scheduler.throttle(() => addTextNode(child, next, forceAddTextNode));
      };
      addTextNode(child, next, undoAddTextNode);
    }
  };

  const addElementChild = (parent, childToAdd, next) => {
    let child = childToAdd;
    if (child.tagName === 'SCRIPT') {
      next(); // skips
      return;
    }

    if (child.tagName === 'IMG') {
      if (!child.naturalWidth) {
        console.log(`Bindery: Waiting for image '${child.src}' size to load`);

        const pollForSize = setInterval(() => {
          if (child.naturalWidth) {
            clearInterval(pollForSize);
            console.log(`Bindery: Image '${child.src}' size loaded.`);
            addElementChild(parent, child, next);
          }
        }, 10);

        child.addEventListener('error', () => {
          console.error(`Bindery: Image '${child.src}' failed to load.`);
          addElementChild(parent, child, next);
        });
        child.src = child.src;
        return;
      }
    }

    child = applyBeforeAddRules(child);

    const addedChildrenSuccess = () => {
      // We're now done with this element and its children,
      // so we pop up a level
      const addedChild = state.breadcrumb.pop();

      // If this child didn't fit any contents on this page,
      // but did have contents on a previous page
      // we should never have added it.
      // TODO: Catch this earlier.
      // if (addedChild.classList.contains(c('continuation'))
      //   && addedChild.children.length === 0) {
      //   addedChild.parentNode.removeChild(addedChild);
      // } else {
      //   // TODO: AfterAdd rules may want to access original child, not split second half
      //   applyAfterAddRules(addedChild);
      // }
      applyAfterAddRules(addedChild);


      if (state.currentPage.hasOverflowed()) {
        // console.log('Bindery: Added element despite overflowing');
      }
      next();
    };

    scheduler.throttle(() => {
      addElementNode(child, addedChildrenSuccess);
    });
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = (node, doneCallback) => {
    if (state.currentPage.hasOverflowed()) {
      if (last(state.breadcrumb).hasAttribute('data-bindery-oversized')) {
        // Do nothing. We just have to add nodes
        // despite the page overflowing.
        // TODO: we may need to walk up the tree
        // to check if this element is the child of
        // an oversized node
      } else {
        // console.error('Bindery: Trying to add node to a page that\'s already overflowing');
        state.currentPage.suppressErrors = true;
        continueOnNewPage();
      }
    }

    // Add this node to the current page or context
    if (!state.breadcrumb[0]) state.currentPage.flowContent.appendChild(node);
    else last(state.breadcrumb).appendChild(node);

    state.breadcrumb.push(node);

    const childNodes = [...node.childNodes];
    node.innerHTML = '';

    // Overflows when empty
    if (state.currentPage.hasOverflowed()) {
      moveNodeToNextPage(node);
    }

    let index = 0;
    const addNext = () => {
      if (!(index < childNodes.length)) {
        doneCallback();
        return;
      }
      const child = childNodes[index];
      index += 1;

      if (child.nodeType === Node.TEXT_NODE) {
        addTextChild(node, child, addNext);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        addElementChild(node, child, addNext);
      } else {
        addNext(); // Skip comments and unknown nodes
      }
    };
    // kick it off
    addNext();
  };

  const finishPagination = () => {
    document.body.removeChild(measureArea);

    const orderedPages = orderPages(state.pages, makeNewPage);
    annotatePages(orderedPages);

    state.book.pages = orderedPages;
    state.book.setCompleted();

    afterBindRules(state.book);

    const end = window.performance.now();
    if (!isDebugging) {
      console.log(`Bindery: Pages created in ${(end - start) / 1000}s`);
    }

    success(state.book);
  };

  content.style.margin = 0;
  content.style.padding = 0;
  continueOnNewPage();
  addElementNode(content, finishPagination);
};

export default paginate;
