import css from "style!css!./bindery.css";

import ElementPath from "./ElementPath"
import elementName from "./ElementName"

import Page from "./Page/page";
import Viewer from "./Viewer/viewer";
import Controls from "./Controls/controls";

import Rules from "./Rules/";

import h from "hyperscript";


class Binder {
  constructor(opts) {

    if (typeof opts.source == "string") {
      this.source = document.querySelector(opts.source)
    }
    else if (opts.source instanceof HTMLElement) {
      this.source = opts.source;
    }
    else {
      console.error(`Bindery: Source should be an element or selector`);
    }

    this.target = opts.target;
    this.rules = [];

    this.controls = new Controls({
      binder: this,
    });

    if (opts.pageSize) {
      Page.setSize(opts.pageSize);
    }

    // if (opts.rules) this.addRules(...opts.rules);
    if (opts.rules) this.addRules(opts.rules);
    this.debugDelay = opts.debugDelay ? opts.debugDelay : 0;


  }
  cancel() {
    this.viewer.cancel();
    this.source.style.display = "";
  }

  addRules(rules) {
    for (let selector in rules) {
      rules[selector].selector = selector;
      this.rules.push(rules[selector]);
    }
  }

  makeBook(doneBinding) {

    // let addPage = () => {
    //
    //   return pg;
    // }

    let state = {
      elPath: new ElementPath(),
      pages: [],
      getNewPage: () => {
        return makeNextPage();
      }
    }

    const DELAY = this.debugDelay; // ms
    let throttle = (func) => {
      if (DELAY > 0) setTimeout(func, DELAY);
      else func();
    }

    let beforeAddRules = (elmt) => {
      this.rules.forEach( (rule) => {
        if (elmt.matches(rule.selector)) {
          if (rule.beforeAdd) {

            let backupPgElmnt = state.currentPage.element.cloneNode(true); // backup page
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
        }
      });
    }
    let afterAddRules = (elmt) => {
      this.rules.forEach( (rule) => {
        if (elmt.matches(rule.selector)) {
          if (rule.afterAdd) rule.afterAdd(elmt, state);
        }
      });
    }
    let newPageRules = (pg) => {
      this.rules.forEach( (rule) => {
        if (rule.newPage) rule.newPage(pg, state);
      });
    }
    let afterBindRules = (pages) => {
      this.rules.forEach( (rule) => {
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
      state.elPath = state.elPath.clone();
      let newPage = new Page();
      newPageRules(newPage);
      state.pages.push(newPage);
      if (state.elPath.root) {
        newPage.flowContent.appendChild(state.elPath.root);
      }
      return newPage;
    };


    // Adds an text node by adding each word one by one
    // until it overflows
    let addTextNode = (node, doneCallback, abortCallback) => {

      state.elPath.last.appendChild(node);

      let textNode = node;
      let origText = textNode.nodeValue;

      let pos = 0;
      let lastPos = pos;
      let addWordIterations = 0;

      let step = (rawPos) => {
        addWordIterations++;

        lastPos = pos;
        pos = parseInt(rawPos);
        let dist = Math.abs(lastPos - pos);


        if (pos > origText.length - 1) {
          throttle(doneCallback);
          return;
        }
        textNode.nodeValue = origText.substr(0, pos);

        if (dist < 1) { // Is done

          // Back out to word boundary
          while(origText.charAt(pos) !== " " && pos > -1) pos--;
          textNode.nodeValue = origText.substr(0, pos);

          if (pos < 1 && origText.trim().length > 0) {
            // console.error(`Bindery: Aborted adding "${origText.substr(0,25)}"`);
            textNode.nodeValue = origText;
            abortCallback();
            return;
          }

          origText = origText.substr(pos);
          pos = 0;

          // Start on new page
          state.currentPage = makeNextPage();
          textNode = document.createTextNode(origText);
          state.elPath.last.appendChild(textNode);

          // If the remainder fits there, we're done
          if (!state.currentPage.hasOverflowed()) {
            throttle(doneCallback);
            return;
          }
        }
        // Search backward
        if (state.currentPage.hasOverflowed()) throttle(() => { step(pos - dist/2); });
        // Search forward
        else throttle(() => { step(pos + dist/2); });
      }

      if (state.currentPage.hasOverflowed()) step(origText.length/2); // find breakpoint
      else throttle(doneCallback); // add in one go
    }


    // Adds an element node by clearing its childNodes, then inserting them
    // one by one recursively until thet overflow the page
    let addElementNode = (node, doneCallback) => {

      // Add this node to the current page or context
      if (state.elPath.items.length == 0) state.currentPage.flowContent.appendChild(node);
      else state.elPath.last.appendChild(node);
      state.elPath.push(node);

      // This can be added instantly without searching for the overflow point
      // but won't apply rules to this node's children
      // if (!hasOverflowed()) {
      //   throttle(doneCallback);
      //   return;
      // }

      if (state.currentPage.hasOverflowed() && node.getAttribute("bindery-break") == "avoid")  {
        let nodeH = node.getBoundingClientRect().height;
        let flowH = state.currentPage.flowBox.getBoundingClientRect().height;
        if (nodeH < flowH) {
          state.elPath.pop();
          state.currentPage = makeNextPage();
          addElementNode(node, doneCallback);
          return;
        }
        else {
          console.warn(`Bindery: Cannot avoid breaking ${elementName(node)}, it's taller than the flow box.`);
        }
      }

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
              let lastEl = state.elPath.pop();
              if (state.elPath.items.length < 1) {
                // console.log(lastEl);
                // console.log(child);
                console.error(`Bindery: Failed to add textNode "${child.nodeValue}" to ${elementName(lastEl)}. Page might be too small?`);
                return;
              }

              let fn = state.currentPage.footer.lastChild; // <--

              state.currentPage = makeNextPage();

              if (fn) state.currentPage.footer.appendChild(fn); // <--

              state.elPath.last.appendChild(node);
              state.elPath.push(node);
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
                state.elPath.pop();
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
    let content = this.source.cloneNode(true);
    content.style.margin = 0; // TODO: make this clearer
    content.style.padding = 0; // TODO: make this clearer
    this.source.style.display = "none";
    addElementNode(content, () => {
      console.log("wow we're done!");
      let measureArea = document.querySelector(".bindery-measure-area");
      document.body.removeChild(measureArea);

      afterBindRules(state.pages);


      this.viewer = new Viewer({
        pages: state.pages,
        target: this.target,
      });

      this.viewer.update();
      this.controls.setState("done");

      if (doneBinding) doneBinding();
    });
  }
}

for (let rule in Rules) {
  Binder[rule] = Rules[rule];
}


module.exports = Binder;
