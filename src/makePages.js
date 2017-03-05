import ElementPath from "./ElementPath"
import elementName from "./ElementName"
import Page from "./Page/page";

export default function(content, rules, done, delay) {

  let state = {
    path: new ElementPath(),
    pages: [],
    getNewPage: () => {
      return makeNextPage();
    }
  }

  const DELAY = delay; // ms
  let throttle = (func) => {
    if (DELAY > 0) setTimeout(func, DELAY);
    else func();
  }

  let beforeAddRules = (elmt) => {
    rules.forEach( (rule) => {
      if (elmt.matches(rule.selector) && rule.beforeAdd) {

        let backupPgElmnt = state.currentPage.element.cloneNode(true);
        let backupElmt = elmt.cloneNode(true);
        rule.beforeAdd(elmt, state);

        if (state.currentPage.hasOverflowed()) {
          // restore from backup
          elmt.innerHTML = backupElmt.innerHTML; // TODO: make less hacky
          state.currentPage.element = backupPgElmnt;
          state.currentPage.number = backupPgElmnt.querySelector(".bindery-num"); // TODO

          state.currentPage = makeNextPage();

          rule.beforeAdd(elmt, state);
        }
      }
    });
  }
  let afterAddRules = (elmt) => {
    rules.forEach( (rule) => {
      if (elmt.matches(rule.selector) && rule.afterAdd) {
        rule.afterAdd(elmt, state);
      }
    });
  }
  let newPageRules = (pg) => {
    rules.forEach( (rule) => {
      if (rule.newPage) rule.newPage(pg, state);
    });
  }
  let afterBindRules = (pages) => {
    rules.forEach( (rule) => {
      if (rule.afterBind) {
        pages.forEach((pg, i) => {
          rule.afterBind(pg, i);
        });
      }
    });
  }

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  let makeNextPage = () => {
    state.path = state.path.clone();
    let newPage = new Page();
    newPageRules(newPage);
    state.pages.push(newPage);
    state.currentPage = newPage; // TODO redundant
    if (state.path.root) {
      newPage.flowContent.appendChild(state.path.root);
    }
    return newPage;
  };

  let moveNodeToNextPage = (nodeToMove) => {
    state.path.pop();

    let fn = state.currentPage.footer.lastChild; // <--
    state.currentPage = makeNextPage();
    if (fn) state.currentPage.footer.appendChild(fn); // <-- move footnote to new page

    state.path.last.appendChild(nodeToMove);
    state.path.push(nodeToMove);
  }

  // Adds an text node by binary searching amount of
  // words until it just barely doesnt overflow
  let addTextNode = (node, doneCallback, abortCallback) => {

    state.path.last.appendChild(node);

    let textNode = node;
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
        state.path.last.appendChild(textNode);

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

    // Add this node to the current page or context
    if (state.path.items.length == 0) {
      state.currentPage.flowContent.appendChild(node);
    }
    else {
      state.path.last.appendChild(node);
    }
    state.path.push(node);

    // Clear this node, before re-adding its children
    let childNodes = [...node.childNodes];
    node.innerHTML = '';

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
          let cancel = () => {
            moveNodeToNextPage(node);
            addTextNode(child, addNextChild, cancel);
          }
          addTextNode(child, addNextChild, cancel);
          break;
        case Node.ELEMENT_NODE: {
          if (child.tagName == "SCRIPT") {
            addNextChild(); // skip
            break;
          }

          beforeAddRules(child);

          throttle(() => {
            addElementNode(child, () => {
              state.path.pop();
              afterAddRules(child);
              addNextChild();
            })
          });
          break;
        }
        default:
          console.log(`Bindery: Unknown node type: ${child.nodeType}`);
      }
    }

    // kick it off
    addNextChild();
  }

  state.currentPage = makeNextPage();
  content.style.margin = 0;
  content.style.padding = 0;

  addElementNode(content, () => {
    console.log("wow we're done!");
    let measureArea = document.querySelector(".bindery-measure-area");
    document.body.removeChild(measureArea);

    state.pages = reorderPages(state.pages);

    afterBindRules(state.pages);

    done(state.pages);
  });
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
