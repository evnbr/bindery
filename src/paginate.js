import elementName from "./ElementName"
import Page from "./Page/page";

export default function(content, rules, done, DELAY) {

  let state = {
    path: [], // Stack representing which element we're currently inside
    pages: [],
    getNewPage: () => { // Gross hack to allow rules to advance to next page
      return makeNextPage();
    }
  }

  let throttle = (func) => {
    if (DELAY > 0) setTimeout(func, DELAY);
    else func();
  }

  let beforeAddRules = (elmt) => {
    rules.forEach( (rule) => {
      if (!rule.selector) return;
      if (elmt.matches(rule.selector) && rule.beforeAdd) {

        let backupPg = state.currentPage.clone();
        let backupElmt = elmt.cloneNode(true);
        rule.beforeAdd(elmt, state);

        if (state.currentPage.hasOverflowed()) {

          console.log("restoring from backup");
          // restore from backup
          elmt.innerHTML = backupElmt.innerHTML; // TODO: make less hacky

          let idx = state.pages.indexOf(state.currentPage);
          state.pages[idx] = backupPg;
          state.currentPage = backupPg;

          state.currentPage = makeNextPage();

          rule.beforeAdd(elmt, state);
        }
      }
    });
  }
  let afterAddRules = (elmt) => {
    rules.forEach( (rule) => {
      if (!rule.selector) return;
      if (elmt.matches(rule.selector) && rule.afterAdd) {
        rule.afterAdd(elmt, state);
      }
    });
  }
  let newPageRules = (pg) => {
    rules.forEach( (rule) => {
      if (rule.afterPageCreated) rule.afterPageCreated(pg, state);
    });
  }
  let afterBindRules = (pages) => {
    rules.forEach( (rule) => {
      if (rule.afterBind) {
        pages.forEach((pg, i, arr) => {
          rule.afterBind(pg, i, arr.length);
        });
      }
    });
  }

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  let makeNextPage = () => {
    if (state.currentPage && state.currentPage.hasOverflowed()) {
      console.error("Bindery: Moved to new page when last one is still overflowing");
      console.log(state.currentPage.element);
    }


    state.path = clonePath(state.path);
    let newPage = new Page();
    newPageRules(newPage);
    state.pages.push(newPage);
    state.currentPage = newPage; // TODO redundant
    if (state.path[0]) {
      newPage.flowContent.appendChild(state.path[0]);
    }

    // make sure the cloned page is valid.
    // this catches elements with an explicitly set height greater than the
    // flow area, which will never be split and cause an infinite loop
    if (newPage.hasOverflowed()) {
      let suspect = last(state.path)
      if (suspect) {
        console.error(`Bindery: NextPage already overflowing, probably due to a style set on ${elementName(suspect)}. It may not fit on the page.`);
        suspect.parentNode.removeChild(suspect);
      }
      else {
        console.error(`Bindery: NextPage already overflowing.`);
      }
    }

    return newPage;
  };

  let moveNodeToNextPage = (nodeToMove) => {
    state.path.pop();

    // let fn = state.currentPage.footer.lastChild; // <--
    state.currentPage = makeNextPage();
    // if (fn) state.currentPage.footer.appendChild(fn); // <-- move footnote to new page

    last(state.path).appendChild(nodeToMove);
    state.path.push(nodeToMove);
  }

  // Adds an text node by binary searching amount of
  // words until it just barely doesnt overflow
  let addTextNode = (textNode, doneCallback, abortCallback) => {

    last(state.path).appendChild(textNode);

    let origText = textNode.nodeValue;

    let lastPos = 0;
    let pos = origText.length/2;;

    let step = () => {

      let dist = Math.abs(lastPos - pos);

      if (pos > origText.length - 1) {
        throttle(doneCallback);
        return;
      }
      textNode.nodeValue = origText.substr(0, pos);

      if (dist < 1) { // Is done

        // Back out to word boundary
        while(origText.charAt(pos) !== " " && pos > -1) pos--;

        if (pos < 1 && origText.trim().length > 0) {
          // console.error(`Bindery: Aborted adding "${origText.substr(0,25)}"`);
          textNode.nodeValue = origText;
          abortCallback();
          return;
        }

        textNode.nodeValue = origText.substr(0, pos);

        origText = origText.substr(pos);
        pos = 0;

        // Start on new page
        state.currentPage = makeNextPage();

        textNode = document.createTextNode(origText);
        last(state.path).appendChild(textNode);

        // If the remainder fits there, we're done
        if (!state.currentPage.hasOverflowed()) {
          throttle(doneCallback);
          return;
        }
      }
      lastPos = pos;

      let hasOverflowed = state.currentPage.hasOverflowed();
      pos = pos + (hasOverflowed ? -dist : dist) / 2;

      throttle(step);
    }

    if (state.currentPage.hasOverflowed()) {
      step(); // find breakpoint
    }
    else throttle(doneCallback); // add in one go
  }


  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  let addElementNode = (node, doneCallback) => {

    if (state.currentPage.hasOverflowed()) {
      node.style.outline = "1px solid red";
      console.error("Bindery: Trying to node to a page that's already overflowing");
    }

    // Add this node to the current page or context
    if (state.path.length == 0) {
      state.currentPage.flowContent.appendChild(node);
    }
    else {
      last(state.path).appendChild(node);
    }
    state.path.push(node);

    // 1. Cache the children
    let childNodes = [...node.childNodes];
    // 2. Clear this node
    node.innerHTML = '';

    // 3. Try adding each child one by one
    let index = 0;
    let addNextChild = () => {
      if (!(index < childNodes.length)) {
        doneCallback();
        return;
      }
      let child = childNodes[index];
      index += 1;

      switch (child.nodeType) {
        case Node.TEXT_NODE:
          let abortCallback = () => {
            moveNodeToNextPage(node);
            addTextNode(child, addNextChild, abortCallback);
          }
          addTextNode(child, addNextChild, abortCallback);
          break;
        case Node.ELEMENT_NODE: {
          if (child.tagName == "SCRIPT") {
            addNextChild(); // skip
            break;
          }

          beforeAddRules(child);

          throttle(() => {
            addElementNode(child, () => {
              let addedChild = state.path.pop(); // WHYY
              // let addedChild = last(state.path);
              afterAddRules(addedChild);  // TODO: AfterAdd rules may want to access original child, not split second half
              addNextChild();
            })
          });
          break;
        }
        default:
          console.log(`Bindery: Unknown node type: ${child.nodeType}`);
          addNextChild(); // skip
      }
    }

    // kick it off
    addNextChild();
  }

  state.currentPage = makeNextPage();
  content.style.margin = 0;
  content.style.padding = 0;

  addElementNode(content, () => {
    console.log(`Bindery: Pages created in ${2}ms`);
    let measureArea = document.querySelector(".bindery-measure-area");
    document.body.removeChild(measureArea);

    let orderedPage = reorderPages(state.pages);

    afterBindRules(orderedPage);

    done(orderedPage);
  });
}

let last = (arr) => arr[arr.length-1];

let clonePath = (origPath) => {
  let newPath = [];
  for (var i = origPath.length - 1; i >= 0; i--) {
    let clone = origPath[i].cloneNode(false);
    clone.innerHTML = '';
    clone.setAttribute("bindery-continuation", true);
    if (clone.id) {
      console.warn(`Bindery: Added a break to ${elementName(clone)}, so "${clone.id}" is no longer a unique ID.`);
    }
    if (i < origPath.length - 1) clone.appendChild(newPath[i+1]);
    newPath[i] = clone;
  }
  return newPath;
}

// TODO: only do this if not double sided?
let reorderPages = (pages) => {
  // TODO: this ignores the cover page, assuming its on the right
  for (var i = 1; i < pages.length - 1; i += 2) {
    let left  = pages[i];

    // TODO: Check more than once
    if (left.alwaysRight) {
      if (left.outOfFlow) {
        pages[i] = pages[i+1];
        pages[i+1] = left;
      }
      else {
        pages.splice(i, 0, new Page());
      }
    }

    let right = pages[i+1];

    if (right.alwaysLeft) {
      if (right.outOfFlow) {
        // TODO: don't overflow, assumes that
        // there are not multiple spreads in a row
        pages[i+1] = pages[i+3];
        pages[i+3] = right;
      }
      else {
        pages.splice(i+1, 0, new Page());
      }
    }
  }

  return pages;
}
