require("style!css!./bindery.css");

import Book from "./book";
import Page from "./page";
import Printer from "./printer";
import el from "./el";

class ElementPath {
  constructor() {
    this.items = [];
    this.update();
  }
  push(item) {
    this.items.push(item);
    this.update();
  }
  pop() {
    const i = this.items.pop();
    this.update();
    return i;
  }
  update() {
    this.root = this.items[0];
    this.last = this.items[this.items.length-1];
  }
  clone() {
    let newPath = new ElementPath();
    for (var i = this.items.length - 1; i >= 0; i--) {
      let clone = this.items[i].cloneNode(false);
      clone.innerHTML = '';
      clone.setAttribute("bindery-continuation", true);
      if (clone.id) {
        console.warn(`Bindery: Added a break to ${prettyName(clone)}, so "${clone.id}" is no longer a unique ID.`);
      }
      if (i < this.items.length - 1) clone.appendChild(newPath.items[i+1]);
      newPath.items[i] = clone;
    }
    newPath.update();
    return newPath;
  }
}

class Binder {
  constructor(opts) {
    this.source = opts.source;
    this.target = opts.target;
    opts.template = `
      <div bindery-page>
        <div bindery-flowbox>
          <div bindery-content>
          </div>
        </div>
        <div bindery-num></div>
        <div bindery-footer></div>
      </div>
    `;

    if (typeof opts.template == "string") {
      let temp = el("div");
      temp.innerHTML = opts.template;
      this.template = temp.children[0];
    }
    else if (opts.template instanceof HTMLElement) {
      this.template = opts.template.cloneNode(true);
      opts.template.remove(opts.template);
    }
    else {
      console.error(`Bindery: Template should be an element or a string`);
    }

    this.book = new Book();
    this.rules = [];

    this.printer = new Printer({
      book: this.book,
      template: this.template,
      target: this.target,
    });

  }
  cancel() {
    this.printer.cancel();
    this.book = new Book();
    this.source.style.display = "";
    this.printer = new Printer({
      book: this.book,
      template: this.template,
      target: this.target,
    });
  }
  defineRule(rule) {
    this.rules.push(rule);
  }
  addPage() {
    let pg = new Page(this.template);
    this.measureArea.appendChild(pg.element);
    this.book.addPage(pg);
    return pg;
  }
  bind(doneBinding) {

    let state = {
      elPath: new ElementPath(),
      nextPage: () => {
        finishPage(state.currentPage);
        state.currentPage = makeContinuation();
      }
    }

    this.measureArea = el(".measureArea");
    document.body.appendChild(this.measureArea);

    const DELAY = 1; // ms
    let throttle = (func) => {
      if (DELAY > 0) setTimeout(func, DELAY);
      else func();
    }


    this.defineRule({
      selector: "[bindery-spread]",
      beforeAdd: (elmt, state) => {
        let spreadMode = elmt.getAttribute("bindery-spread");
        state.prevPage = state.currentPage;
        state.prevElementPath = state.elPath;
        state.currentPage = makeContinuation();
        if (spreadMode == "bleed") {
          state.currentPage.element.classList.add("bleed");
        }
      },
      afterAdd: (elmt, state) => {
        finishPage(state.currentPage);
        state.currentPage = state.prevPage;
        state.elPath = state.prevElementPath;
      },
    });


    let beforeAddRules = (elmt) => {
      this.rules.forEach( (rule) => {
        if (elmt.matches(rule.selector)) {
          if (rule.beforeAdd) {

            let backupPg = state.currentPage.element.cloneNode(true); // backup page
            let backupElmt = elmt.cloneNode(true);
            rule.beforeAdd(elmt, state);

            if (hasOverflowed()) {
              // restore from backup
              this.measureArea.replaceChild(backupPg, state.currentPage.element);
              elmt.innerHTML = backupElmt.innerHTML; // TODO: fix this
              state.currentPage.element = backupPg;

              finishPage(state.currentPage);
              state.currentPage = makeContinuation();

              rule.beforeAdd(elmt, state);
            }
          }
        }
      });
    }
    let afterAddRules = (elmt) => {
      this.rules.forEach( (rule) => {
        if (elmt.matches(rule.selector)) {
          if (rule.afterAdd) {
            rule.afterAdd(elmt, state);
          }
        }
      });
    }

    let hasOverflowed = () => {
      let contentH = state.currentPage.flowContent.getBoundingClientRect().height;
      let boxH = state.currentPage.flowBox.getBoundingClientRect().height;
      return contentH >= boxH;
    }

    let finishPage = (pg) => {
      this.measureArea.removeChild(pg.element);
    }

    // Creates clones for ever level of tag
    // we were in when we overflowed the last page
    let makeContinuation = () => {
      state.elPath = state.elPath.clone();
      let newPage = this.addPage();
      newPage.flowContent.appendChild(state.elPath.root);
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

          if (pos < 1) {
            // console.error(`Bindery: Aborted adding "${origText.substr(0,25)}"`);
            textNode.nodeValue = origText;
            abortCallback();
            return;
          }
          // console.log(addWordIterations + " iterations");

          origText = origText.substr(pos);
          pos = 0;

          // Start on new page
          finishPage(state.currentPage);
          state.currentPage = makeContinuation();
          textNode = document.createTextNode(origText);
          state.elPath.last.appendChild(textNode);

          // If the remainder fits there, we're done
          if (!hasOverflowed()) {
            throttle(doneCallback);
            return;
          }
        }
        // Search backward
        if (hasOverflowed()) throttle(() => { step(pos - dist/2); });
        // Search forward
        else throttle(() => { step(pos + dist/2); });
      }

      if (hasOverflowed()) step(origText.length/2); // find breakpoint
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

      if (hasOverflowed() && node.getAttribute("bindery-break") == "avoid")  {
        let nodeH = node.getBoundingClientRect().height;
        let flowH = state.currentPage.flowBox.getBoundingClientRect().height;
        if (nodeH < flowH) {
          state.elPath.pop();
          finishPage(state.currentPage);
          state.currentPage = makeContinuation();
          addElementNode(node, doneCallback);
          return;
        }
        else {
          console.warn(`Bindery: Cannot avoid breaking ${prettyName(node)}, it's taller than the flow box.`);
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
              state.elPath.pop();
              if (state.elPath.items.length < 1) {
                console.error("Bindery: Failed to add any node. Page might be too small?");
                return;
              }

              let fn = state.currentPage.footer.lastChild; // <--

              finishPage(state.currentPage);
              state.currentPage = makeContinuation();

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

    state.currentPage = this.addPage();
    let content = this.source.cloneNode(true);
    content.style.margin = 0; // TODO: make this clearer
    this.source.style.display = "none";
    addElementNode(content, () => {
      console.log("wow we're done!");
      document.body.removeChild(this.measureArea);

      this.printer.setOrdered();

      if (doneBinding) doneBinding(this.book);
    });
  }
}

let prettyName = (node) => `"${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ""}.${[...node.classList].join(".")}"`;

module.exports = Binder;
