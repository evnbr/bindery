import elToStr from './utils/elementToString';
import Page from './Page/page';


const last = arr => arr[arr.length - 1];

// TODO: only do this if not double sided?
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
        pages.splice(i, 0, new Page());
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
  const MAX_CALLS = 1000;
  let numberOfCalls = 0;
  const throttle = (func) => {
    if (DELAY > 0) {
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

  const beforeAddRules = (elmt) => {
    rules.forEach((rule) => {
      if (!rule.selector) return;
      if (elmt.matches(rule.selector) && rule.beforeAdd) {
        const backupPg = state.currentPage.clone();
        const backupElmt = elmt.cloneNode(true);
        rule.beforeAdd(elmt, state, makeNextPage);

        if (state.currentPage.hasOverflowed()) {
          console.log('restoring from backup');
          // restore from backup
          elmt.innerHTML = backupElmt.innerHTML; // TODO: make less hacky

          const idx = state.pages.indexOf(state.currentPage);
          state.pages[idx] = backupPg;
          state.currentPage = backupPg;

          state.currentPage = makeNextPage();

          rule.beforeAdd(elmt, state, makeNextPage);
        }
      }
    });
  };
  const afterAddRules = (elmt) => {
    rules.forEach((rule) => {
      if (!rule.selector) return;
      if (elmt.matches(rule.selector) && rule.afterAdd) {
        rule.afterAdd(elmt, state, makeNextPage);
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
    // nodeToMove.style.outline = "1px solid red";

    // TODO: This breaks example 3 but is required for example 2.
    // state.path.pop();

    // const old = state.currentPage.creationOrder;
    // let fn = state.currentPage.footer.lastChild; // <--
    state.currentPage = makeNextPage();
    // if (fn) state.currentPage.footer.appendChild(fn); // <-- move footnote to new page

    // console.log(`moved "${ elToStr(nodeToMove)}" from page ${old}
    // to ${state.currentPage.creationOrder}`);

    last(state.path).appendChild(nodeToMove);
    state.path.push(nodeToMove);
  };

  // Adds an text node by binary searching amount of
  // words until it just barely doesnt overflow
  const addTextNode = (originalNode, doneCallback, abortCallback) => {
    let textNode = originalNode;
    let origText = textNode.nodeValue;
    last(state.path).appendChild(textNode);

    let lastPos = 0;
    let pos = origText.length / 2;

    const step = () => {
      const dist = Math.abs(lastPos - pos);

      if (pos > origText.length - 1) {
        throttle(doneCallback);
        return;
      }
      textNode.nodeValue = origText.substr(0, pos);

      if (dist < 1) { // Is done
        // Back out to word boundary
        while (origText.charAt(pos) !== ' ' && pos > -1) pos -= 1;

        if (pos < 1 && origText.trim().length > 0) {
          // console.error(`Bindery: Aborted adding "${origText.substr(0,25)}..."`);
          textNode.nodeValue = origText;
          abortCallback();
          return;
        }

        const fittingText = origText.substr(0, pos);
        const overflowingText = origText.substr(pos);
        textNode.nodeValue = fittingText;
        origText = overflowingText;

        // pos = 0; // IS THIS THE PROBLEM?
        lastPos = 0;
        pos = origText.length / 2;

        // console.log("Dividing text node: ...",
        //   fittingText.substr(fittingText.length - 24),
        //   " 🛑 ",
        //   overflowingText.substr(0, 24),
        //   "..."
        // );

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
      lastPos = pos;

      const hasOverflowed = state.currentPage.hasOverflowed();
      pos += (hasOverflowed ? -dist : dist) / 2;

      throttle(step);
    };

    if (state.currentPage.hasOverflowed()) {
      step(); // find breakpoint
    } else throttle(doneCallback); // add in one go
  };


  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = (node, doneCallback) => {
    if (state.currentPage.hasOverflowed()) {
      // node.style.outline = "1px solid red";
      console.error('Bindery: Trying to node to a page that\'s already overflowing');
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
            // let lastNode = last(state.path);
            // console.log("— last node in stack:")
            // console.log(elToStr(lastNode));
            // console.log("— proposed node to move:")
            // console.log(elToStr(node));
          moveNodeToNextPage(node);
          addTextNode(child, addNextChild, abortCallback);
        };
          // console.log(`Adding text child of "${elToStr(node)}"`);
          // console.log(`Beginning to add "${child.nodeValue.substr(0,24)}"`);
        addTextNode(child, addNextChild, abortCallback);
        break;
      }
      case Node.ELEMENT_NODE: {
        if (child.tagName === 'SCRIPT') {
          addNextChild(); // skip
          break;
        }

        beforeAddRules(child);

        throttle(() => {
          addElementNode(child, () => {
            const addedChild = state.path.pop(); // WHYY
            // let addedChild = last(state.path);
            // TODO: AfterAdd rules may want to access original child, not split second half
            afterAddRules(addedChild);
            addNextChild();
          });
        });
        break;
      }
      default:
        console.log(`Bindery: Unknown node type: ${child.nodeType}`);
        addNextChild(); // skip
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
