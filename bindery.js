class Printer {
  constructor(opts) {
    this.book = opts.book;
    this.target = this.book.target;
    this.printWrapper = document.createElement("div");
    this.printWrapper.setAttribute("bindery-print-wrapper", true);
  }
  printOrdered() {
    if (this.book.pages.length % 2 !== 0) {
      let pg = new Page(binder.template);
      this.book.addPage(pg);
    }
    let spacerPage = new Page(binder.template);
    let spacerPage2 = new Page(binder.template);
    spacerPage.element.style.visibility = "hidden";
    spacerPage2.element.style.visibility = "hidden";
    this.book.pages.unshift(spacerPage);
    this.book.pages.push(spacerPage2);

    for (var i = 0; i < this.book.pages.length; i += 2) {
      let wrap = this.printWrapper.cloneNode(false);
      let l = this.book.pages[i].element;
      let r = this.book.pages[i+1].element;
      l.setAttribute("bindery-left", true);
      r.setAttribute("bindery-right", true);
      wrap.appendChild(l);
      wrap.appendChild(r);
      this.target.appendChild(wrap);
    }
  }
}

class Book {
  constructor(opts) {
    this.target = opts.target;
    this.pageNum = 1;
    this.pages = [];
  }
  addPage(page) {
    page.setNumber(this.pageNum);
    this.pageNum++;
    this.pages.push(page);
  }
}

class Page {
  constructor(template) {
    this.element = template.cloneNode(true);
    this.flowBox = this.element.querySelector("[bindery-flowbox]");
    this.flowContent = this.element.querySelector("[bindery-content]");
    this.footer = this.element.querySelector("[bindery-footer]");
  }
  setNumber(n) {
    let num = this.element.querySelector("[bindery-num]");
    num.textContent = n;
  }
}

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
      let temp = document.createElement("div");
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

    this.book = new Book({ target: opts.target });
    this.rules = [];
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
    let elementPath = new ElementPath();

    this.measureArea = el("div", "measureArea");
    document.body.appendChild(this.measureArea);

    const DELAY = 0; // ms
    let throttle = (func) => {
      if (DELAY > 0) setTimeout(func, DELAY);
      else func();
    }

    this.defineRule({
      selector: "[bindery-break='before']",
      beforeAdd: (elmt, pg) => {
        if (pg.flowContent.innerText !== "") {
          finishPage(currentPage);
          currentPage = makeContinuation();
        }
      },
    });

    let prevPage, prevElementPath;
    this.defineRule({
      selector: "[bindery-spread]",
      beforeAdd: (elmt, pg) => {
        let spreadMode = elmt.getAttribute("bindery-spread");
        prevPage = currentPage;
        prevElementPath = elementPath;
        currentPage = makeContinuation();
        if (spreadMode == "bleed") {
          currentPage.element.classList.add("bleed");
        }
      },
      afterAdd: (elmt, pg) => {
        finishPage(currentPage);
        currentPage = prevPage;
        elementPath = prevElementPath;
      },
    });


    let beforeAddRules = (elmt) => {
      this.rules.forEach( (rule) => {
        if (elmt.matches(rule.selector)) {
          if (rule.beforeAdd) {
            rule.beforeAdd(elmt, currentPage);
            if (hasOverflowed()) {
              rule.cancelAdd(elmt, currentPage);
              finishPage(currentPage);
              currentPage = makeContinuation();
              rule.beforeAdd(elmt, currentPage);
            }
          }
        }
      });
    }
    let afterAddRules = (elmt) => {
      this.rules.forEach( (rule) => {
        if (elmt.matches(rule.selector)) {
          if (rule.afterAdd) {
            rule.afterAdd(elmt, currentPage);
          }
        }
      });
    }

    let hasOverflowed = () => {
      let contentH = currentPage.flowContent.getBoundingClientRect().height;
      let boxH = currentPage.flowBox.getBoundingClientRect().height;
      return contentH >= boxH;
    }

    let finishPage = (pg) => {
      this.measureArea.removeChild(pg.element);
    }

    // Creates clones for ever level of tag
    // we were in when we overflowed the last page
    let makeContinuation = () => {
      elementPath = elementPath.clone();
      let newPage = this.addPage();
      newPage.flowContent.appendChild(elementPath.root);
      return newPage;
    };


    // Adds an text node by adding each word one by one
    // until it overflows
    let addTextNode = (node, doneCallback, abortCallback) => {

      elementPath.last.appendChild(node);

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
          console.log(addWordIterations + " iterations");

          origText = origText.substr(pos);
          pos = 0;

          // Start on new page
          finishPage(currentPage);
          currentPage = makeContinuation();
          textNode = document.createTextNode(origText);
          elementPath.last.appendChild(textNode);

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
      if (elementPath.items.length == 0) currentPage.flowContent.appendChild(node);
      else elementPath.last.appendChild(node);
      elementPath.push(node);

      // This can be added instantly without searching for the overflow point
      if (!hasOverflowed()) {
        throttle(doneCallback);
        return;
      }

      if (hasOverflowed() && node.getAttribute("bindery-break") == "avoid")  {
        let nodeH = node.getBoundingClientRect().height;
        let flowH = currentPage.flowBox.getBoundingClientRect().height;
        if (nodeH < flowH) {
          elementPath.pop();
          finishPage(currentPage);
          currentPage = makeContinuation();
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
              elementPath.pop();

              let fn = currentPage.footer.lastChild; // <--

              finishPage(currentPage);
              currentPage = makeContinuation();

              currentPage.footer.appendChild(fn); // <--

              elementPath.last.appendChild(node);
              elementPath.push(node);
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
                elementPath.pop();
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

    let currentPage = this.addPage();
    addElementNode(this.source, () => {
      console.log("wow we're done!");
      document.body.removeChild(this.measureArea);

      let printer = new Printer({
        book: this.book,
      });
      printer.printOrdered();

      doneBinding(this.book);
    });
  }
}

let el = (type, className) => {
  element = document.createElement(type);
  element.classList.add(className);
  return element;
}

let prettyName = (node) => `"${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ""}.${[...node.classList].join(".")}"`;
