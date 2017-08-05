import elToStr from './utils/elementToString';
import { prefix, prefixClass } from './utils/prefixClass';
import Book from './Book';
import Page from './Page';

const SHOULD_DEBUG_TEXT = false;
const MAXIMUM_PAGE_LIMIT = 9999;

const last = arr => arr[arr.length - 1];

const reorderPages = (pages, makeNewPage) => {
  const orderedPages = pages;

  // TODO: this ignores the cover page, assuming its on the right
  for (let i = 1; i < orderedPages.length - 1; i += 2) {
    const left = orderedPages[i];

    // TODO: Check more than once
    if (left.alwaysRight) {
      if (left.outOfFlow) {
        orderedPages[i] = pages[i + 1];
        orderedPages[i + 1] = left;
      } else {
        pages.splice(i, 0, makeNewPage());
      }
    }

    const right = orderedPages[i + 1];

    if (right.alwaysLeft) {
      if (right.outOfFlow) {
        // TODO: don't overflow, assumes that
        // there are not multiple spreads in a row
        orderedPages[i + 1] = pages[i + 3];
        orderedPages[i + 3] = right;
      } else {
        pages.splice(i + 1, 0, new Page());
      }
    }
  }

  return orderedPages;
};

const annotatePages = (pages) => {
  // Page numbers
  const facingPages = true; // TODO: Pass in facingpages options
  if (facingPages) {
    pages.forEach((page, i) => {
      page.number = i + 1;
      page.setLeftRight((i % 2 === 0) ? 'right' : 'left');
    });
  } else {
    pages.forEach((page) => { page.setLeftRight('right'); });
  }

  // Sections
  const running = { h1: '', h2: '', h3: '', h4: '', h5: '', h6: '' };
  pages.forEach((page) => {
    page.heading = {};
    Object.keys(running).forEach((tagName, i) => {
      const element = page.element.querySelector(tagName);
      if (element) {
        running[tagName] = element.textContent;
        // clear remainder
        Object.keys(running).forEach((tag, j) => {
          if (j > i) running[tag] = '';
        });
      }
      if (running[tagName] !== '') {
        page.heading[tagName] = running[tagName];
      }
    });
  });
};

const paginate = function (
  content,
  rules,
  paginateDoneCallback,
  paginateProgressCallback,
  paginateErrorCallback,
  DELAY) {
  const state = {
    path: [], // Stack representing which element we're currently inside
    pages: [],
  };

  const markAsContinues = (node) => {
    node.classList.add(prefix('continues'));
    rules
      .filter(rule => rule.customContinuesClass)
      .forEach(rule => node.classList.add(rule.customContinuesClass));
  };

  const markAsContinuation = (node) => {
    node.classList.add(prefix('continuation'));
    rules
      .filter(rule => rule.customContinuationClass)
      .forEach(rule => node.classList.add(rule.customContinuationClass));
  };

  // TODO: only do this if not double sided?
  const clonePath = (origPath) => {
    const newPath = [];
    for (let i = origPath.length - 1; i >= 0; i -= 1) {
      const original = origPath[i];
      const clone = original.cloneNode(false); // shallow
      clone.innerHTML = '';
      markAsContinues(original);
      markAsContinuation(clone);
      if (clone.id) {
        // console.warn(`Bindery: Added a break to ${elToStr(clone)},
        // so "${clone.id}" is no longer a unique ID.`);
      }
      if (clone.tagName === 'OL') {
        // restart numbering
        let prevStart = 1;
        if (original.hasAttribute('start')) {
          // the OL is also a continuation
          prevStart = parseInt(original.getAttribute('start'), 10);
        }
        if (i < origPath.length - 1 && origPath[i + 1].tagName === 'LI') {
          // the first list item is a continuation
          prevStart -= 1;
        }
        const prevCount = original.children.length;
        const newStart = prevStart + prevCount;
        clone.setAttribute('start', newStart);
      }
      if (i < origPath.length - 1) clone.appendChild(newPath[i + 1]);
      newPath[i] = clone;
    }
    return newPath;
  };


  // Even when there is no debugDelay,
  // the throttler will occassionally use rAF
  // to prevent the call stack from getting too big.
  //
  // There might be a better way to do this.
  const MAX_CALLS = 100;
  let numberOfCalls = 0;
  const throttle = (func, shouldPause) => {
    if (shouldPause) {
      window.paginateStep = func;
    } else if (DELAY > 0) {
      setTimeout(func, DELAY);
    } else if (numberOfCalls < MAX_CALLS) {
      numberOfCalls += 1;
      func();
    } else {
      numberOfCalls = 0;
      window.requestAnimationFrame(func);
    }
  };

  const newPageRules = (pg) => {
    rules.forEach((rule) => {
      if (rule.afterPageCreated) rule.afterPageCreated(pg, state);
    });
  };

  const makeNewPage = () => {
    const newPage = new Page();
    newPageRules(newPage);
    return newPage;
  };

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  const continueOnNewPage = () => {
    if (state.currentPage && state.currentPage.hasOverflowed()) {
      console.warn(state.currentPage.element);
      throw Error('Bindery: Moved to new page when last one is still overflowing');
    }

    if (state.pages.length === 500) {
      console.warn('Bindery: More than 500 pages, performance may be slow.');
    } else if (state.pages.length === 1000) {
      console.warn('Bindery: More than 1000 pages, performance may be slow.');
    } else if (state.pages.length > MAXIMUM_PAGE_LIMIT) {
      paginateErrorCallback('Maximum page limit exceeded');
      throw Error('Bindery: Maximum page limit exceeded. Suspected runaway layout.');
    }

    state.path = clonePath(state.path);
    const newPage = makeNewPage();
    state.pages.push(newPage);
    state.currentPage = newPage; // TODO redundant
    if (state.path[0]) {
      newPage.flowContent.appendChild(state.path[0]);
    }

    // make sure the cloned page is valid.
    if (newPage.hasOverflowed()) {
      const suspect = last(state.path);
      if (suspect) {
        console.error(`Bindery: NextPage already overflowing, probably due to a style set on ${elToStr(suspect)}. It may not fit on the page.`);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.error('Bindery: NextPage already overflowing.');
      }
    }

    paginateProgressCallback(state.pages.length);

    return newPage;
  };

  const beforeAddRules = (element) => {
    let addedElement = element;
    rules.forEach((rule) => {
      if (!rule.selector) return;
      if (addedElement.matches(rule.selector) && rule.beforeAdd) {
        addedElement = rule.beforeAdd(addedElement, state, continueOnNewPage);
      }
    });
  };

  const afterAddRules = (originalElement) => {
    let addedElement = originalElement;
    rules.forEach((rule) => {
      if (!rule.selector) return;
      if (addedElement.matches(rule.selector) && rule.afterAdd) {
        addedElement = rule.afterAdd(
          addedElement,
          state,
          continueOnNewPage,
          function overflowCallback(problemElement) {
          // TODO:
          // While this does catch overflows, it introduces a few new bugs.
          // It is pretty aggressive to move the entire node to the next page.
          // - 1. there is no guarentee it will fit on the new page
          // - 2. if it has childNodes, those rules will not be invalidated,
          // which means footnotes will get left ona previous page.
          // - 3. if it is a large paragraph, it will leave a large gap. the
          // correct approach would be to only need to invalidate
          // the last line of text.
            problemElement.parentNode.removeChild(problemElement);
            continueOnNewPage();
            const lastEl = last(state.path);
            lastEl.appendChild(problemElement);
            return rule.afterAdd(problemElement, state, continueOnNewPage, () => {
              console.log(`Couldn't apply ${rule.name} to ${elToStr(problemElement)}. Caused overflows twice.`);
            });
          }
        );
      }
    });
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

  console.log(selectorsNotToSplit);

  const isSplittable = (node) => {
    if (selectorsNotToSplit.some(sel => node.matches(sel))) {
      if (node.hasAttribute('data-bindery-did-move')) {
        // don't split it again.
        return true;
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
    state.path.pop();

    // find the nearest splittable parent
    let willMove = nodeToMove;
    const pathToRestore = [];
    while (!isSplittable(last(state.path))) {
      // console.log('Not OK to split:', last(state.path));
      willMove = state.path.pop();
      pathToRestore.unshift(willMove);
    }

    // console.log('OK to split:', last(state.path));
    // console.log('Will move:', willMove);
    willMove.setAttribute('data-bindery-did-move', true);

    const parent = willMove.parentNode;
    // remove the unsplittable node and subnodes
    parent.removeChild(willMove);

    // TODO: step back even further if the
    // to avoid leaving otherwise empty nodes behind
    if (last(state.path).textContent.trim() === '') {
      // console.log('Leaving empty node', last(state.path));
      parent.appendChild(willMove);
      willMove = state.path.pop();
      pathToRestore.unshift(willMove);
      willMove.parentNode.removeChild(willMove);
    }

    // create new page and clone context onto it
    continueOnNewPage();

    // append node as first in new page
    last(state.path).appendChild(willMove);

    // restore subpath
    pathToRestore.forEach((restore) => {
      state.path.push(restore);
    });
    state.path.push(nodeToMove);
  };

  const addTextNode = (originalNode, doneCallback, abortCallback) => {
    const textNode = originalNode;
    last(state.path).appendChild(textNode);

    if (state.currentPage.hasOverflowed()) {
      // It doesnt fit
      textNode.parentNode.removeChild(textNode);
      abortCallback();
    } else {
      // It fits
      throttle(doneCallback);
    }
  };

  // Adds an text node by incrementally adding words
  // until it just barely doesnt overflow
  const addTextNodeIncremental = (originalNode, doneCallback, abortCallback) => {
    let originalText = originalNode.nodeValue;
    let textNode = originalNode;
    last(state.path).appendChild(textNode);

    if (!state.currentPage.hasOverflowed()) {
      throttle(doneCallback);
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
          abortCallback();
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
        last(state.path).appendChild(textNode);

        // If the remainder fits there, we're done
        if (!state.currentPage.hasOverflowed()) {
          // console.log("Fits entirely!");
          throttle(doneCallback);
          return;
        }

        throttle(splitTextStep);
        return;
      }
      if (pos > originalText.length - 1) {
        throttle(doneCallback);
        return;
      }

      pos += 1;
      while (originalText.charAt(pos) !== ' ' && pos < originalText.length) pos += 1;


      throttle(splitTextStep, SHOULD_DEBUG_TEXT);
    };

    splitTextStep();
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = (node, doneCallback) => {
    if (state.currentPage.hasOverflowed()) {
      console.error('Bindery: Trying to add node to a page that\'s already overflowing');
    }

    // Add this node to the current page or context
    if (state.path.length === 0) {
      state.currentPage.flowContent.appendChild(node);
    } else {
      last(state.path).appendChild(node);
    }
    state.path.push(node);

    // 1. Cache the children
    const childNodes = [...node.childNodes];
    // 2. Clear this node
    node.innerHTML = '';

    // Overflows when empty
    if (state.currentPage.hasOverflowed()) {
      // console.error(`Bindery: Adding ${elToStr(node)} causes overflow even when empty`);
      moveNodeToNextPage(node);
    }

    if (!isSplittable(node)) {
      // // Try adding in one go
      // childNodes.forEach((child) => {
      //   node.appendChild(child);
      // });
      // // If it worked, go to next node
      // if (!state.currentPage.hasOverflowed()) {
      //   throttle(doneCallback);
      //   return;
      // }
      // // Try moving to next page in one go
      // moveNodeToNextPage(node);
      //
      // // If it worked, go to next node
      // if (!state.currentPage.hasOverflowed()) {
      //   throttle(doneCallback);
      //   return;
      // }
      //
      // // Sorry, we gotta break it
      // node.innerHTML = '';
    }

    // 3. Try adding each child one by one
    let index = 0;
    const addNextChild = () => {
      if (!(index < childNodes.length)) {
        doneCallback();
        return;
      }
      const child = childNodes[index];
      index += 1;

      switch (child.nodeType) {
      case Node.TEXT_NODE: {
        if (isSplittable(node)) {
          const abortCallback = () => {
            moveNodeToNextPage(node);
            addTextNodeIncremental(child, addNextChild, abortCallback);
          };
          addTextNodeIncremental(child, addNextChild, abortCallback);
        } else {
          const abortCallback = () => {
            moveNodeToNextPage(node);
            node.outline = '1px solid red';
            addTextNode(child, addNextChild, abortCallback);
          };
          addTextNode(child, addNextChild, abortCallback);
        }
        break;
      }
      case Node.ELEMENT_NODE: {
        if (child.tagName === 'SCRIPT') {
          addNextChild(); // skip
          break;
        }

        beforeAddRules(child);

        throttle(function addChildAsElement() {
          addElementNode(child, function addedChildSuccess() {
            // We're now done with this element and its children,
            // so we pop up a level
            const addedChild = state.path.pop();

            // TODO: AfterAdd rules may want to access original child, not split second half
            afterAddRules(addedChild);

            if (state.currentPage.hasOverflowed()) {
              console.log('wasn\'t really a success was it');
            }
            addNextChild();
          });
        });
        break;
      }
      default:
        // Skip unknown nodes
        addNextChild();
      }
    };

    // kick it off
    addNextChild();
  };

  const start = window.performance.now();
  content.style.margin = 0;
  content.style.padding = 0;

  const book = new Book();
  state.book = book;
  continueOnNewPage();

  const finish = () => {
    const end = window.performance.now();
    console.log(`Bindery: Pages created in ${(end - start) / 1000}s`);
    const measureArea = document.querySelector(prefixClass('measure-area'));
    document.body.removeChild(measureArea);

    const orderedPages = reorderPages(state.pages, makeNewPage);
    annotatePages(orderedPages);

    book.pages = orderedPages;
    book.setCompleted();

    afterBindRules(book);
    paginateDoneCallback(book);
  };

  addElementNode(content, finish);
};

export default paginate;
