/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	Binder = __webpack_require__(1);
	el = __webpack_require__(5);

	let binder = new Binder({
	  source: document.querySelector(".content"),
	  target: document.querySelector(".export"),
	});

	binder.defineRule({
	  selector: "[bindery-break='before']",
	  beforeAdd: (elmt, state) => {
	    if (state.currentPage.flowContent.innerText !== "") {
	      state.nextPage();
	    }
	  },
	});

	binder.defineRule({
	  selector: "p",
	  beforeAdd: (elmt, state) => {
	    let fn = el("div", "footnote");
	    let pg = state.currentPage;
	    let n = pg.footer.querySelectorAll(".footnote").length;
	    fn.textContent = `${n} ${elmt.textContent.substr(0,28)}`;
	    pg.footer.appendChild(fn);
	    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
	  },
	});

	binder.defineRule({
	  selector: "a",
	  beforeAdd: (elmt, state) => {
	    let fn = el("div", "footnote");
	    let pg = state.currentPage;
	    let n = pg.footer.querySelectorAll(".footnote").length;
	    fn.innerHTML = `${n} Link to <a href='#'>${elmt.href}</a>`;
	    pg.footer.appendChild(fn);
	    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
	  },
	});



	binder.bind((book) => {
	  console.log(book);
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	Book = __webpack_require__(2);
	Page = __webpack_require__(3);
	Printer = __webpack_require__(4);
	el = __webpack_require__(5);


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

	    let binderState = {
	      elPath: new ElementPath(),
	      nextPage: () => {
	        finishPage(binderState.currentPage);
	        binderState.currentPage = makeContinuation();
	      }
	    }

	    this.measureArea = el("div", "measureArea");
	    document.body.appendChild(this.measureArea);

	    const DELAY = 0; // ms
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

	            let backupPg = binderState.currentPage.element.cloneNode(true); // backup page
	            let backupElmt = elmt.cloneNode(true);
	            rule.beforeAdd(elmt, binderState);

	            if (hasOverflowed()) {
	              // restore from backup
	              this.measureArea.replaceChild(backupPg, binderState.currentPage.element);
	              elmt.innerHTML = backupElmt.innerHTML; // TODO: fix this
	              binderState.currentPage.element = backupPg;

	              finishPage(binderState.currentPage);
	              binderState.currentPage = makeContinuation();

	              rule.beforeAdd(elmt, binderState);
	            }
	          }
	        }
	      });
	    }
	    let afterAddRules = (elmt) => {
	      this.rules.forEach( (rule) => {
	        if (elmt.matches(rule.selector)) {
	          if (rule.afterAdd) {
	            rule.afterAdd(elmt, binderState);
	          }
	        }
	      });
	    }

	    let hasOverflowed = () => {
	      let contentH = binderState.currentPage.flowContent.getBoundingClientRect().height;
	      let boxH = binderState.currentPage.flowBox.getBoundingClientRect().height;
	      return contentH >= boxH;
	    }

	    let finishPage = (pg) => {
	      this.measureArea.removeChild(pg.element);
	    }

	    // Creates clones for ever level of tag
	    // we were in when we overflowed the last page
	    let makeContinuation = () => {
	      binderState.elPath = binderState.elPath.clone();
	      let newPage = this.addPage();
	      newPage.flowContent.appendChild(binderState.elPath.root);
	      return newPage;
	    };


	    // Adds an text node by adding each word one by one
	    // until it overflows
	    let addTextNode = (node, doneCallback, abortCallback) => {

	      binderState.elPath.last.appendChild(node);

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
	          finishPage(binderState.currentPage);
	          binderState.currentPage = makeContinuation();
	          textNode = document.createTextNode(origText);
	          binderState.elPath.last.appendChild(textNode);

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
	      if (binderState.elPath.items.length == 0) binderState.currentPage.flowContent.appendChild(node);
	      else binderState.elPath.last.appendChild(node);
	      binderState.elPath.push(node);

	      // This can be added instantly without searching for the overflow point
	      // but won't apply rules to this node's children
	      // if (!hasOverflowed()) {
	      //   throttle(doneCallback);
	      //   return;
	      // }

	      if (hasOverflowed() && node.getAttribute("bindery-break") == "avoid")  {
	        let nodeH = node.getBoundingClientRect().height;
	        let flowH = binderState.currentPage.flowBox.getBoundingClientRect().height;
	        if (nodeH < flowH) {
	          binderState.elPath.pop();
	          finishPage(binderState.currentPage);
	          binderState.currentPage = makeContinuation();
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
	              binderState.elPath.pop();

	              let fn = binderState.currentPage.footer.lastChild; // <--

	              finishPage(binderState.currentPage);
	              binderState.currentPage = makeContinuation();

	              binderState.currentPage.footer.appendChild(fn); // <--

	              binderState.elPath.last.appendChild(node);
	              binderState.elPath.push(node);
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
	                binderState.elPath.pop();
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

	    binderState.currentPage = this.addPage();
	    addElementNode(this.source, () => {
	      console.log("wow we're done!");
	      document.body.removeChild(this.measureArea);

	      let printer = new Printer({
	        book: this.book,
	        template: this.template
	      });
	      printer.setOrdered();

	      doneBinding(this.book);
	    });
	  }
	}

	let prettyName = (node) => `"${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ""}.${[...node.classList].join(".")}"`;

	module.exports = Binder;


/***/ },
/* 2 */
/***/ function(module, exports) {

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

	module.exports = Book;


/***/ },
/* 3 */
/***/ function(module, exports) {

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

	module.exports = Page;


/***/ },
/* 4 */
/***/ function(module, exports) {

	class Printer {
	  constructor(opts) {
	    this.book = opts.book;
	    this.target = this.book.target;
	    this.template = opts.template;
	    this.printWrapper = document.createElement("div");
	    this.printWrapper.setAttribute("bindery-print-wrapper", true);
	  }
	  setOrdered() {
	    if (this.book.pages.length % 2 !== 0) {
	      let pg = new Page(this.template);
	      this.book.addPage(pg);
	    }
	    let spacerPage = new Page(this.template);
	    let spacerPage2 = new Page(this.template);
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
	  setInteractive() {
	    if (this.book.pages.length % 2 !== 0) {
	      let pg = new Page(this.template);
	      this.book.addPage(pg);
	    }
	    let spacerPage = new Page(this.template);
	    let spacerPage2 = new Page(this.template);
	    spacerPage.element.style.visibility = "hidden";
	    spacerPage2.element.style.visibility = "hidden";
	    this.book.pages.unshift(spacerPage);
	    this.book.pages.push(spacerPage2);

	    for (var i = 0; i < this.book.pages.length; i += 2) {
	      let wrap = this.printWrapper.cloneNode(false);
	      wrap.setAttribute("bindery-preview", true);
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

	module.exports = Printer;


/***/ },
/* 5 */
/***/ function(module, exports) {

	let el = (type, className) => {
	  element = document.createElement(type);
	  element.classList.add(className);
	  return element;
	}

	module.exports = el;


/***/ }
/******/ ]);