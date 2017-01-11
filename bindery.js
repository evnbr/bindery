class Printer {
  constructor(opts) {
    this.book = opts.book;
    this.target = this.book.target;
    this.printWrapper = document.createElement("div");
    this.printWrapper.setAttribute("bindery-print-wrapper", true);
  }
  printOrdered() {
    if (this.book.pages.length % 2 !== 0) {
      this.book.addPage();
    }
    let spacerPage = new Page(this.book.pageTemplate);
    let spacerPage2 = new Page(this.book.pageTemplate);
    spacerPage.element.style.visibility = "hidden";
    spacerPage2.element.style.visibility = "hidden";
    this.book.pages.unshift(spacerPage);
    this.book.pages.push(spacerPage2);

    for (var i = 0; i < this.book.pages.length; i += 2) {
      let wrap = this.printWrapper.cloneNode(false);
      wrap.appendChild(this.book.pages[i].element);
      wrap.appendChild(this.book.pages[i+1].element);
      this.target.appendChild(wrap);
    }
  }
}

class Book {
  constructor(opts) {
    this.target = opts.target;
    this.pageTemplate = opts.template;
    this.pageNum = 1;
    this.pages = [];
  }
  addPage() {
    let page = new Page(this.pageTemplate);
    page.setNumber(this.pageNum);
    this.pageNum++;
    this.pages.push(page);
    this.target.appendChild(page.element);
    return page;
  }
  nextFlowBox() {
    let pg = this.addPage();
    return pg.flowBox;
  }
}

class Page {
  constructor(template) {
    this.element = template.cloneNode(true);
    this.flowBox = this.element.querySelector("[bindery-flowbox]");
  }
  setNumber(n) {
    let num = this.element.querySelector("[bindery-num]");
    num.textContent = n;
  }
}

class Binder {
  constructor(opts) {
    this.source = opts.source;

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

    this.book = new Book({
      target: opts.target,
      template: this.template,
    })

    this.context = [];
  }
  currentEl() {
    return this.context[this.context.length-1];
  }
  bind(doneBinding) {
    let DELAY = 200; // ms

    let hasOverflowed = (t) => {
      let elementBottom = t.getBoundingClientRect().bottom;
      let pageY = currentFlowBox.getBoundingClientRect().top;
      let pageH = currentFlowBox.getBoundingClientRect().height;
      elementBottom = elementBottom - pageY;
      return elementBottom > pageH;
    }

    // Creates clones for ever level of tag
    // we were in when we overflowed the last page
    let cloneContextToNextFlowBox = () => {
      currentFlowBox = this.book.nextFlowBox();
      for (var i = this.context.length - 1; i >= 0; i--) {
        let clone = this.context[i].cloneNode(false);
        clone.innerHTML = '';
        clone.setAttribute("bindery-continuation", true);
        if (clone.id) {
          console.warn(`Bindery: Added a break to ${prettyName(clone)}, so "${clone.id}" is no longer a unique ID.`);
        }
        if (i < this.context.length - 1) {
          clone.appendChild(this.context[i+1]);
        }
        this.context[i] = clone;
      }
      currentFlowBox.appendChild(this.context[0]);
    };


    let getAllSpaces = (str) => {
      let indexes = [];
      for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) == " ") {
          indexes.push(i);
        }
      }
      return indexes;
    }
    // Adds an text node by adding each word one by one
    // until it overflows
    let addTextNode = (origTextNode, doneCallback) => {
      let delayedDone = () => {
        setTimeout(doneCallback, DELAY);
      }

      this.currentEl().appendChild(origTextNode);

      let textNode = origTextNode;
      let origText = textNode.nodeValue;
      // let breakPositionsToTry = getAllSpaces(origText);
      // let breakPosIndex = 0;

      let posShift = 1;
      let addWordCount = 0;

      let addWord = (pos) => {
        if (pos > origText.length - 1) {
          delayedDone()
          return;
        }
        if (origText.charAt(pos) !== " " && pos < origText.length-1) {
          // console.log(`adjusted to ${pos+1}`);
          posShift += 1;
          addWord(pos + 1);
          return;
        }
        addWordCount++;
        textNode.nodeValue = origText.substr(0, pos);
        if (hasOverflowed(this.currentEl())) {
          // Go back to before we overflowed
          pos = pos - posShift;
          // console.log(`reset pos to ${pos} by subtracting ${posShift}, could have set it to ${breakPositionsToTry[breakPosIndex+1]}`)

          textNode.nodeValue = origText.substr(0, pos);
          if (pos > 0) {
            origText = origText.substr(pos);
            pos = 0;
            // breakPositionsToTry = getAllSpaces(origText);
            // breakPosIndex = 0;
          }

          // Start on new page
          // console.log(`We naively tried ${addWordCount} of ${breakPositionsToTry.length} text break points`);
          cloneContextToNextFlowBox();
          textNode = document.createTextNode(origText);
          this.currentEl().appendChild(textNode);

          // If the remainder fits there, we're done
          if (!hasOverflowed(this.currentEl())) {
            delayedDone()
            return;
          }
        }
        setTimeout(() => {
          // breakPosIndex++;
          // console.log(`trying ${pos+2}, could have tried ${breakPositionsToTry[breakPosIndex]}`)
          // addWord(breakPositionsToTry[breakPosIndex])

          posShift = 2; // skip past the space
          addWord(pos + 2);

        }, DELAY);
      }

      // we added it all in one go
      if (!hasOverflowed(this.currentEl())) {
        delayedDone();
      }
      // iterate word-by-word
      else {
        addWord(0);
      }
    }


    // Adds an element node by clearing its childNodes, then inserting them
    // one by one recursively until thet overflow the page
    let addElementNode = (node, doneCallback) => {

      // Add this node to the current page or context
      if (this.context.length == 0) currentFlowBox.appendChild(this.source);
      else this.currentEl().appendChild(node);
      this.context.push(node);

      // This can be added instantly without searching for the overflow point
      if (!hasOverflowed(node)) {
        doneCallback();
        return;
      }
      if (hasOverflowed(node) && node.getAttribute("bindery-break") == "avoid")  {
        let nodeH = node.getBoundingClientRect().height;
        let flowH = currentFlowBox.getBoundingClientRect().height;
        if (nodeH < flowH) {
          this.context.pop();
          cloneContextToNextFlowBox();
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
            addTextNode(child, addNextChild);
            break;
          case Node.ELEMENT_NODE: {
            if (child.tagName == "SCRIPT") {
              addNextChild(); // skip
              break;
            }
            if (child.getAttribute("bindery-break") == "before") {
              if (currentFlowBox.innerText !== "") {
                cloneContextToNextFlowBox();
              }
            }
            if (child.hasAttribute("bindery-spread")) {
              let spreadMode = child.getAttribute("bindery-spread");
              let oldBox = currentFlowBox;
              let oldContext = this.context.slice(0);
              cloneContextToNextFlowBox();
              if (spreadMode == "bleed") {
                currentFlowBox.classList.add("bleed");
              }
              addElementNode(child, () => {
                currentFlowBox = oldBox;
                this.context = oldContext;
                addNextChild();
              });
              break;
            }
            addElementNode(child, () => {
              this.context.pop();
              addNextChild();
            });
            break;
          }
          default:
            console.log(`Bindery: Unknown node type: ${child.nodeType}`);
        }

      }
      addNextChild();
    }

    let currentFlowBox = this.book.nextFlowBox();
    addElementNode(this.source, () => {
      console.log("wow we're done!");
      doneBinding(this.book);
      let printer = new Printer({
        book: this.book,
      });
      printer.printOrdered();
    });
  }
}

let el = (type, className) => {
  element = document.createElement(type);
  element.classList.add(className);
  return element;
}

let last = (arr) => arr[arr.length - 1];

let prettyName = (node) => `"${node.tagName.toLowerCase()}${node.id ? "#"+node.id : ""}.${[...node.classList].join(".")}"`;
