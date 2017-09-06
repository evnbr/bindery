import h from 'hyperscript';

// Utils
import elToStr from '../utils/elementToString';
import c from '../utils/prefixClass';
import { last } from '../utils';

// Bindery
import Book from '../Book';
import Page from '../Page';

// paginate
import Scheduler from './Scheduler';
import orderPages from './orderPages';
import annotatePages from './annotatePages';
import breadcrumbCloner from './breadcrumbCloner';
import waitForImage from './waitForImage';

const MAXIMUM_PAGE_LIMIT = 9999;

const paginate = ({ content, rules, success, progress, error, isDebugging }) => {
  // SETUP
  const start = window.performance.now();
  const scheduler = new Scheduler(isDebugging);
  const cloneBreadcrumb = breadcrumbCloner(rules);
  const measureArea = document.body.appendChild(h(c('.measure-area')));

  const state = {
    breadcrumb: [],
    pages: [],
    book: new Book(),
  };


  let updatePaginationProgress;
  let finishPagination;

  const currentFlowElement = function () {
    return state.breadcrumb[0]
      ? last(state.breadcrumb)
      : state.currentPage.flowContent;
  };

  const applyNewPageRules = (pg) => {
    rules.forEach((rule) => {
      if (rule.afterPageCreated) rule.afterPageCreated(pg, state);
    });
  };

  const makeNewPage = () => {
    const newPage = new Page();
    measureArea.appendChild(newPage.element);

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
      const suspect = currentFlowElement();
      if (suspect) {
        console.error(`Bindery: NextPage already overflowing, probably due to a style set on ${elToStr(suspect)}. It may not fit on the page.`);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.error('Bindery: NextPage already overflowing.');
      }
    }

    updatePaginationProgress();

    return newPage;
  };

  const beforeAddRules = rules.filter(r => r.selector && r.beforeAdd);
  const afterAddRules = rules.filter(r => r.selector && r.afterAdd);
  const afterBindRules = rules.filter(r => r.afterBind);

  const applyBeforeAddRules = (element) => {
    let addedElement = element;
    beforeAddRules.forEach((rule) => {
      if (addedElement.matches(rule.selector)) {
        addedElement = rule.beforeAdd(addedElement, state, continueOnNewPage, makeNewPage);
      }
    });
    return addedElement;
  };

  // TODO:
  // While this does catch overflows, it introduces a few new bugs.
  // It is pretty aggressive to move the entire node to the next page.
  // - 1. there is no guarentee it will fit on the new page
  // - 2. if it has childNodes, those side effects will not be undone,
  // which means footnotes will get left on previous page.
  // - 3. if it is a large paragraph, it will leave a large gap. the
  // ideal approach would be to only need to invalidate
  // the last line of text.
  const applyAfterAddRules = (originalElement) => {
    let addedElement = originalElement;
    afterAddRules.forEach((rule) => {
      if (addedElement.matches(rule.selector)) {
        addedElement = rule.afterAdd(
          addedElement,
          state,
          continueOnNewPage,
          function overflowCallback(problemElement) {
            problemElement.parentNode.removeChild(problemElement);
            continueOnNewPage();
            currentFlowElement().appendChild(problemElement);
            return rule.afterAdd(problemElement, state, continueOnNewPage, () => {
              console.log(`Couldn't apply ${rule.name} to ${elToStr(problemElement)}. Caused overflows twice.`);
            });
          }
        );
      }
    });
    return addedElement;
  };

  const applyAfterBindRules = (book) => {
    afterBindRules.forEach((rule) => {
      book.pages.forEach((page) => {
        rule.afterBind(page, book);
      });
    });
  };

  // Walk up the tree to see if we can safely
  // insert a split into this node.
  const selectorsNotToSplit = rules
    .filter(rule => rule.avoidSplit)
    .map(rule => rule.selector);

  const isSplittable = (node) => {
    if (selectorsNotToSplit.some(sel => node.matches(sel))) {
      if (node.hasAttribute('data-bindery-did-move')
        || node.classList.contains(c('continuation'))) {
        return true; // don't split it again.
      }
      return false;
    }
    if (node.parentElement) {
      return isSplittable(node.parentElement);
    }
    return true;
  };

  const moveElementToNextPage = (nodeToMove) => {
    // So this node won't get cloned. TODO: this is unclear
    state.breadcrumb.pop();

    if (state.breadcrumb.length < 1) {
      throw Error('Bindery: Attempting to move the top-level element is not allowed');
    }

    // find the nearest splittable parent
    let willMove = nodeToMove;
    const pathToRestore = [];
    while (state.breadcrumb.length > 1 && !isSplittable(currentFlowElement())) {
      // console.log('Not OK to split:', currentFlowElement());
      willMove = state.breadcrumb.pop();
      pathToRestore.unshift(willMove);
    }

    // Once a node is moved to a new page, it should no longer trigger another
    // move. otherwise tall elements will endlessly get shifted to the next page
    willMove.setAttribute('data-bindery-did-move', true);

    const parent = willMove.parentNode;
    parent.removeChild(willMove);

    if (state.breadcrumb.length > 1 && currentFlowElement().textContent.trim() === '') {
      parent.appendChild(willMove);
      willMove = state.breadcrumb.pop();
      pathToRestore.unshift(willMove);
      willMove.parentNode.removeChild(willMove);
    }

    if (state.currentPage.isEmpty) {
      // Fail to move to next page, instead continue here
      nodeToMove.setAttribute('data-bindery-larger-than-page', true);
    } else {
      if (state.currentPage.hasOverflowed()) {
        state.currentPage.suppressErrors = true;
      }
      continueOnNewPage();
    }

    // append node as first in new page
    currentFlowElement().appendChild(willMove);

    // restore subpath
    pathToRestore.forEach((restore) => {
      state.breadcrumb.push(restore);
    });

    // TODO: Confusing. If we didn't pop this node above, we don't
    // need to push it back again.
    state.breadcrumb.push(nodeToMove);
  };

  const addTextNode = (textNode, doneCallback, undoAddTextNode) => {
    currentFlowElement().appendChild(textNode);

    if (state.currentPage.hasOverflowed()) {
      textNode.parentNode.removeChild(textNode);
      undoAddTextNode();
    } else {
      scheduler.throttle(doneCallback);
    }
  };

  // Adds an text node by incrementally adding words
  // until it just barely doesnt overflow
  const addTextNodeIncremental = (textNode, doneCallback, undoAddTextNode) => {
    const originalText = textNode.nodeValue;
    currentFlowElement().appendChild(textNode);

    if (!state.currentPage.hasOverflowed()) {
      scheduler.throttle(doneCallback);
      return;
    }
    if (currentFlowElement().hasAttribute('data-bindery-larger-than-page')) {
      scheduler.throttle(doneCallback);
      return;
    }

    let pos = 0;

    // Must be in viewport for caretRangeFromPoint
    // measureArea.appendChild(state.currentPage.element);
    //
    // const flowBoxPos = state.currentPage.flowBox.getBoundingClientRect();
    // const endX = flowBoxPos.left + flowBoxPos.width - 1;
    // const endY = flowBoxPos.top + flowBoxPos.height - 30; // TODO: Real line height
    // const range = document.caretRangeFromPoint(endX, endY);
    // if (range && range.startContainer === textNode) {
    //   console.log(`Predicted ${range.startOffset}: ${originalText.substr(0, range.startOffset)}`);
    //   pos = range.startOffset;
    // }

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

        // console.log(`Text breaks at ${pos}: ${originalText.substr(0, pos)}`);

        const fittingText = originalText.substr(0, pos);
        const overflowingText = originalText.substr(pos);
        textNode.nodeValue = fittingText;

        // Start on new page
        continueOnNewPage();
        const remainingTextNode = document.createTextNode(overflowingText);
        addTextNodeIncremental(remainingTextNode, doneCallback, undoAddTextNode);
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
      currentFlowElement().appendChild(child);
      state.currentPage.suppressErrors = true;
      continueOnNewPage();
      scheduler.throttle(next);
    };

    if (isSplittable(parent)) {
      const undoAddTextNode = () => {
        if (state.breadcrumb.length > 1) {
          moveElementToNextPage(parent);
          scheduler.throttle(() => addTextNodeIncremental(child, next, forceAddTextNode));
        } else {
          forceAddTextNode();
        }
      };

      addTextNodeIncremental(child, next, undoAddTextNode);
    } else {
      const undoAddTextNode = () => {
        moveElementToNextPage(parent);
        scheduler.throttle(() => addTextNode(child, next, forceAddTextNode));
      };
      addTextNode(child, next, undoAddTextNode);
    }
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = (elementToAdd, doneCallback) => {
    if (state.currentPage.hasOverflowed()) {
      if (currentFlowElement().hasAttribute('data-bindery-larger-than-page')) {
        // Do nothing. We just have to add nodes despite the page overflowing.
      } else {
        state.currentPage.suppressErrors = true;
        continueOnNewPage();
      }
    }
    const element = applyBeforeAddRules(elementToAdd);

    currentFlowElement().appendChild(element);

    state.breadcrumb.push(element);

    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    // Overflows when empty
    if (state.currentPage.hasOverflowed()) {
      moveElementToNextPage(element);
    }

    let index = 0;
    const addNext = () => {
      if (!(index < childNodes.length)) {
        // We're now done with this element and its children,
        // so we pop up a level
        const addedChild = state.breadcrumb.pop();
        applyAfterAddRules(addedChild);

        if (state.currentPage.hasOverflowed()) {
          // console.log('Bindery: Added element despite overflowing');
        }

        doneCallback();
        return;
      }
      const child = childNodes[index];
      index += 1;

      if (child.nodeType === Node.TEXT_NODE) {
        addTextChild(element, child, addNext);
      } else if (child.nodeType === Node.ELEMENT_NODE
        && child.tagName !== 'SCRIPT') {
        if (child.tagName === 'IMG' && !child.naturalWidth) {
          waitForImage(child, () => {
            addElementNode(child, addNext);
          });
        } else {
          scheduler.throttle(() => {
            addElementNode(child, addNext);
          });
        }
      } else {
        addNext(); // Skip comments and unknown nodes
      }
    };
    // kick it off
    addNext();
  };

  const startPagination = () => {
    content.style.margin = 0;
    content.style.padding = 0;
    continueOnNewPage();
    scheduler.throttle(() => {
      addElementNode(content, finishPagination);
    });
  };
  updatePaginationProgress = () => {
    annotatePages(state.pages);
    state.book.pages = state.pages;
    // applyAfterBindRules(state.book);
    progress(state.book);
  };
  finishPagination = () => {
    document.body.removeChild(measureArea);

    const orderedPages = orderPages(state.pages, makeNewPage);
    annotatePages(orderedPages);

    state.book.pages = orderedPages;
    state.book.setCompleted();
    applyAfterBindRules(state.book);

    const end = window.performance.now();
    if (!isDebugging) {
      console.log(`Bindery: Pages created in ${(end - start) / 1000}s`);
    }

    success(state.book);
  };
  startPagination();
};

export default paginate;
