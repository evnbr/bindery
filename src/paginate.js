import elToStr from './utils/elementToString';
import Page from './Page/page';

const SHOULD_DEBUG_TEXT = false;

const last = arr => arr[arr.length - 1];

// TODO: only do this if not double sided?
const clonePath = (origPath) => {
  const newPath = [];
  for (let i = origPath.length - 1; i >= 0; i -= 1) {
    const clone = origPath[i].cloneNode(false); // shallow
    clone.innerHTML = '';
    clone.setAttribute('bindery-continuation', true);
    if (clone.id) {
      console.warn(`Bindery: Added a break to ${elToStr(clone)}, so "${clone.id}" is no longer a unique ID.`);
    }
    if (i < origPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }
  return newPath;
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

  // Even when there is no debugDelay,
  // the throttler will occassionally use rAF
  // to prevent the call stack from getting too big.
  //
  // There might be a better way to do this.
  const MAX_CALLS = 500;
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
  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  const makeNextPage = () => {
    if (state.currentPage && state.currentPage.hasOverflowed()) {
      console.warn('Bindery: Moved to new page when last one is still overflowing', state.currentPage.element);
      throw Error('Overflowed');
    }
    if (state.pages.length === 500) {
      console.warn('Bindery: More than 500 pages, performance may be slow.');
    } else if (state.pages.length === 1000) {
      console.warn('Bindery: More than 1000 pages, performance may be slow.');
    }

    state.path = clonePath(state.path);
    const newPage = new Page();
    newPage.creationOrder = state.pages.length;
    newPageRules(newPage);
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

  const makeSpacerPage = () => {
    const newPage = new Page();
    newPage.creationOrder = state.pages.length;
    newPageRules(newPage);
    return newPage;
  };

  const reorderPages = (pages) => {
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
          pages.splice(i, 0, makeSpacerPage());
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


  const beforeAddRules = (elmt) => {
    rules.forEach((rule) => {
      if (!rule.selector) return;
      if (elmt.matches(rule.selector) && rule.beforeAdd) {
        rule.beforeAdd(elmt, state, makeNextPage);
      }
    });
  };

  const afterAddRules = (elmt) => {
    rules.forEach((rule) => {
      if (!rule.selector) return;
      if (elmt.matches(rule.selector) && rule.afterAdd) {
        rule.afterAdd(elmt, state, makeNextPage, function overflowCallback() {
          // TODO:
          // While this does catch overflows, it introduces a few new bugs.
          // It is pretty aggressive to move the entire node to the next page.
          // - 1. there is no guarentee it will fit on the new page
          // - 2. if it has childNodes, those rules will not be invalidated,
          // which means footnotes will get left ona previous page.
          // - 3. if it is a large paragraph, it will leave a large gap. the
          // correct approach would be to only need to invalidate
          // the last line of text.
          elmt.parentNode.removeChild(elmt);
          makeNextPage();
          last(state.path).appendChild(elmt);
          rule.afterAdd(elmt, state, makeNextPage, () => {
            console.log(`Couldn't apply ${rule.name} to ${elToStr(elmt)}. Caused overflows twice.`);
          });
        });
      }
    });
  };
  const afterBindRules = (pages) => {
    rules.forEach((rule) => {
      if (rule.afterBind) {
        pages.forEach((pg, i, arr) => {
          rule.afterBind(pg, i, arr.length);
        });
      }
    });
  };

  const moveNodeToNextPage = (nodeToMove) => {
    // console.log(`Moving ${elToStr(nodeToMove)} to next page`);

    const discarded = state.path.pop();     // TODO: this is unclear.
    // console.log(`Discard ${elToStr(discarded)}`);

    // remove from old page
    nodeToMove.parentNode.removeChild(nodeToMove);

    state.currentPage = makeNextPage();

    // append to new page
    last(state.path).appendChild(nodeToMove);

    state.path.push(nodeToMove);
  };

  // Adds an text node by incrementally adding words
  // until it just barely doesnt overflow
  const addTextNode = (originalNode, doneCallback, abortCallback) => {
    let textNode = originalNode;
    let origText = textNode.nodeValue;
    last(state.path).appendChild(textNode);

    if (!state.currentPage.hasOverflowed()) {
      throttle(doneCallback);
      return;
    }

    let pos = 0;

    const step = () => {
      textNode.nodeValue = origText.substr(0, pos);

      if (state.currentPage.hasOverflowed()) {
        // Back out to word boundary
        if (origText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
        while (origText.charAt(pos) !== ' ' && pos > 0) pos -= 1;

        // if (pos < 1 && origText.trim().length > 0) {
        if (pos < 1) {
          textNode.nodeValue = origText;
          textNode.parentNode.removeChild(textNode);
          abortCallback();
          return;
        }

        const fittingText = origText.substr(0, pos);
        const overflowingText = origText.substr(pos);
        textNode.nodeValue = fittingText;
        origText = overflowingText;

        pos = 0;

        // Start on new page
        state.currentPage = makeNextPage();

        textNode = document.createTextNode(origText);
        last(state.path).appendChild(textNode);

        // If the remainder fits there, we're done
        if (!state.currentPage.hasOverflowed()) {
          // console.log("Fits entirely!");
          throttle(doneCallback);
          return;
        }

        throttle(step);
        return;
      }
      if (pos > origText.length - 1) {
        throttle(doneCallback);
        return;
      }

      pos += 1;
      while (origText.charAt(pos) !== ' ' && pos < origText.length) pos += 1;


      throttle(step, SHOULD_DEBUG_TEXT);
    };

    step(); // find breakpoint
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = (node, doneCallback) => {
    if (state.currentPage.hasOverflowed()) {
      // node.style.outline = "1px solid red";
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

    if (state.currentPage.hasOverflowed()) {
      console.error(`Bindery: Adding ${elToStr(node)} causes overflow even when empty`);
      moveNodeToNextPage(node);
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
        const abortCallback = () => {
          moveNodeToNextPage(node);
          addTextNode(child, addNextChild, abortCallback);
        };
        addTextNode(child, addNextChild, abortCallback);
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
            // TODO: Because addElementNode will push node onto the path again
            const addedChild = state.path.pop();
            // let addedChild = last(state.path);

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

  state.currentPage = makeNextPage();
  content.style.margin = 0;
  content.style.padding = 0;

  addElementNode(content, () => {
    console.log(`Bindery: Pages created in ${2}ms`);
    const measureArea = document.querySelector('.bindery-measure-area');
    document.body.removeChild(measureArea);

    const orderedPages = reorderPages(state.pages);

    const facingPages = true; // TODO: Pass in facingpages options
    if (facingPages) {
      orderedPages.forEach((page, i) => {
        page.number = i + 1;
        page.setLeftRight((i % 2 === 0) ? 'right' : 'left');
      });
    } else {
      orderedPages.forEach((page) => { page.setLeftRight('right'); });
    }
    afterBindRules(orderedPages);

    paginateDoneCallback(orderedPages);
  });
};

export default paginate;
