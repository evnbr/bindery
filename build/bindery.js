var Bindery =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _book = __webpack_require__(1);
	
	var _book2 = _interopRequireDefault(_book);
	
	var _page = __webpack_require__(2);
	
	var _page2 = _interopRequireDefault(_page);
	
	var _printer = __webpack_require__(3);
	
	var _printer2 = _interopRequireDefault(_printer);
	
	var _el = __webpack_require__(4);
	
	var _el2 = _interopRequireDefault(_el);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	__webpack_require__(5);
	
	var ElementPath = function () {
	  function ElementPath() {
	    _classCallCheck(this, ElementPath);
	
	    this.items = [];
	    this.update();
	  }
	
	  _createClass(ElementPath, [{
	    key: "push",
	    value: function push(item) {
	      this.items.push(item);
	      this.update();
	    }
	  }, {
	    key: "pop",
	    value: function pop() {
	      var i = this.items.pop();
	      this.update();
	      return i;
	    }
	  }, {
	    key: "update",
	    value: function update() {
	      this.root = this.items[0];
	      this.last = this.items[this.items.length - 1];
	    }
	  }, {
	    key: "clone",
	    value: function clone() {
	      var newPath = new ElementPath();
	      for (var i = this.items.length - 1; i >= 0; i--) {
	        var clone = this.items[i].cloneNode(false);
	        clone.innerHTML = '';
	        clone.setAttribute("bindery-continuation", true);
	        if (clone.id) {
	          console.warn("Bindery: Added a break to " + prettyName(clone) + ", so \"" + clone.id + "\" is no longer a unique ID.");
	        }
	        if (i < this.items.length - 1) clone.appendChild(newPath.items[i + 1]);
	        newPath.items[i] = clone;
	      }
	      newPath.update();
	      return newPath;
	    }
	  }]);
	
	  return ElementPath;
	}();
	
	var Binder = function () {
	  function Binder(opts) {
	    _classCallCheck(this, Binder);
	
	    this.source = opts.source;
	    this.target = opts.target;
	    opts.template = "\n      <div bindery-page>\n        <div bindery-flowbox>\n          <div bindery-content>\n          </div>\n        </div>\n        <div bindery-num></div>\n        <div bindery-footer></div>\n      </div>\n    ";
	
	    if (typeof opts.template == "string") {
	      var temp = (0, _el2.default)("div");
	      temp.innerHTML = opts.template;
	      this.template = temp.children[0];
	    } else if (opts.template instanceof HTMLElement) {
	      this.template = opts.template.cloneNode(true);
	      opts.template.remove(opts.template);
	    } else {
	      console.error("Bindery: Template should be an element or a string");
	    }
	
	    this.book = new _book2.default();
	    this.rules = [];
	
	    this.printer = new _printer2.default({
	      book: this.book,
	      template: this.template,
	      target: this.target
	    });
	  }
	
	  _createClass(Binder, [{
	    key: "cancel",
	    value: function cancel() {
	      this.printer.cancel();
	      this.book = new _book2.default();
	      this.source.style.display = "";
	      this.printer = new _printer2.default({
	        book: this.book,
	        template: this.template,
	        target: this.target
	      });
	    }
	  }, {
	    key: "defineRule",
	    value: function defineRule(rule) {
	      this.rules.push(rule);
	    }
	  }, {
	    key: "addPage",
	    value: function addPage() {
	      var pg = new _page2.default(this.template);
	      this.measureArea.appendChild(pg.element);
	      this.book.addPage(pg);
	      return pg;
	    }
	  }, {
	    key: "bind",
	    value: function bind(doneBinding) {
	      var _this = this;
	
	      var state = {
	        elPath: new ElementPath(),
	        nextPage: function nextPage() {
	          finishPage(state.currentPage);
	          state.currentPage = makeContinuation();
	        }
	      };
	
	      this.measureArea = (0, _el2.default)(".measureArea");
	      document.body.appendChild(this.measureArea);
	
	      var DELAY = 1; // ms
	      var throttle = function throttle(func) {
	        if (DELAY > 0) setTimeout(func, DELAY);else func();
	      };
	
	      this.defineRule({
	        selector: "[bindery-spread]",
	        beforeAdd: function beforeAdd(elmt, state) {
	          var spreadMode = elmt.getAttribute("bindery-spread");
	          state.prevPage = state.currentPage;
	          state.prevElementPath = state.elPath;
	          state.currentPage = makeContinuation();
	          if (spreadMode == "bleed") {
	            state.currentPage.element.classList.add("bleed");
	          }
	        },
	        afterAdd: function afterAdd(elmt, state) {
	          finishPage(state.currentPage);
	          state.currentPage = state.prevPage;
	          state.elPath = state.prevElementPath;
	        }
	      });
	
	      var beforeAddRules = function beforeAddRules(elmt) {
	        _this.rules.forEach(function (rule) {
	          if (elmt.matches(rule.selector)) {
	            if (rule.beforeAdd) {
	
	              var backupPg = state.currentPage.element.cloneNode(true); // backup page
	              var backupElmt = elmt.cloneNode(true);
	              rule.beforeAdd(elmt, state);
	
	              if (hasOverflowed()) {
	                // restore from backup
	                _this.measureArea.replaceChild(backupPg, state.currentPage.element);
	                elmt.innerHTML = backupElmt.innerHTML; // TODO: fix this
	                state.currentPage.element = backupPg;
	
	                finishPage(state.currentPage);
	                state.currentPage = makeContinuation();
	
	                rule.beforeAdd(elmt, state);
	              }
	            }
	          }
	        });
	      };
	      var afterAddRules = function afterAddRules(elmt) {
	        _this.rules.forEach(function (rule) {
	          if (elmt.matches(rule.selector)) {
	            if (rule.afterAdd) {
	              rule.afterAdd(elmt, state);
	            }
	          }
	        });
	      };
	
	      var hasOverflowed = function hasOverflowed() {
	        var contentH = state.currentPage.flowContent.getBoundingClientRect().height;
	        var boxH = state.currentPage.flowBox.getBoundingClientRect().height;
	        return contentH >= boxH;
	      };
	
	      var finishPage = function finishPage(pg) {
	        _this.measureArea.removeChild(pg.element);
	      };
	
	      // Creates clones for ever level of tag
	      // we were in when we overflowed the last page
	      var makeContinuation = function makeContinuation() {
	        state.elPath = state.elPath.clone();
	        var newPage = _this.addPage();
	        newPage.flowContent.appendChild(state.elPath.root);
	        return newPage;
	      };
	
	      // Adds an text node by adding each word one by one
	      // until it overflows
	      var addTextNode = function addTextNode(node, doneCallback, abortCallback) {
	
	        state.elPath.last.appendChild(node);
	
	        var textNode = node;
	        var origText = textNode.nodeValue;
	
	        var pos = 0;
	        var lastPos = pos;
	        var addWordIterations = 0;
	
	        var step = function step(rawPos) {
	          addWordIterations++;
	
	          lastPos = pos;
	          pos = parseInt(rawPos);
	          var dist = Math.abs(lastPos - pos);
	
	          if (pos > origText.length - 1) {
	            throttle(doneCallback);
	            return;
	          }
	          textNode.nodeValue = origText.substr(0, pos);
	
	          if (dist < 1) {
	            // Is done
	
	            // Back out to word boundary
	            while (origText.charAt(pos) !== " " && pos > -1) {
	              pos--;
	            }textNode.nodeValue = origText.substr(0, pos);
	
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
	          if (hasOverflowed()) throttle(function () {
	            step(pos - dist / 2);
	          });
	          // Search forward
	          else throttle(function () {
	              step(pos + dist / 2);
	            });
	        };
	
	        if (hasOverflowed()) step(origText.length / 2); // find breakpoint
	        else throttle(doneCallback); // add in one go
	      };
	
	      // Adds an element node by clearing its childNodes, then inserting them
	      // one by one recursively until thet overflow the page
	      var addElementNode = function addElementNode(node, doneCallback) {
	
	        // Add this node to the current page or context
	        if (state.elPath.items.length == 0) state.currentPage.flowContent.appendChild(node);else state.elPath.last.appendChild(node);
	        state.elPath.push(node);
	
	        // This can be added instantly without searching for the overflow point
	        // but won't apply rules to this node's children
	        // if (!hasOverflowed()) {
	        //   throttle(doneCallback);
	        //   return;
	        // }
	
	        if (hasOverflowed() && node.getAttribute("bindery-break") == "avoid") {
	          var nodeH = node.getBoundingClientRect().height;
	          var flowH = state.currentPage.flowBox.getBoundingClientRect().height;
	          if (nodeH < flowH) {
	            state.elPath.pop();
	            finishPage(state.currentPage);
	            state.currentPage = makeContinuation();
	            addElementNode(node, doneCallback);
	            return;
	          } else {
	            console.warn("Bindery: Cannot avoid breaking " + prettyName(node) + ", it's taller than the flow box.");
	          }
	        }
	
	        // Clear this node, before re-adding its children
	        var childNodes = [].concat(_toConsumableArray(node.childNodes));
	        node.innerHTML = '';
	
	        var index = 0;
	        var addNextChild = function addNextChild() {
	          if (!(index < childNodes.length)) {
	            doneCallback();
	            return;
	          }
	          var child = childNodes[index];
	          index += 1;
	
	          (function () {
	            switch (child.nodeType) {
	              case Node.TEXT_NODE:
	                var cancel = function cancel() {
	                  state.elPath.pop();
	                  if (state.elPath.items.length < 1) {
	                    console.error("Bindery: Failed to add any node. Page might be too small?");
	                    return;
	                  }
	
	                  var fn = state.currentPage.footer.lastChild; // <--
	
	                  finishPage(state.currentPage);
	                  state.currentPage = makeContinuation();
	
	                  if (fn) state.currentPage.footer.appendChild(fn); // <--
	
	                  state.elPath.last.appendChild(node);
	                  state.elPath.push(node);
	                  addTextNode(child, addNextChild, cancel);
	                };
	                addTextNode(child, addNextChild, cancel);
	                break;
	              case Node.ELEMENT_NODE:
	                {
	                  if (child.tagName == "SCRIPT") {
	                    addNextChild(); // skip
	                    break;
	                  }
	
	                  beforeAddRules(child);
	
	                  throttle(function () {
	                    addElementNode(child, function () {
	                      state.elPath.pop();
	                      afterAddRules(child);
	                      addNextChild();
	                    });
	                  });
	                  break;
	                }
	              default:
	                console.log("Bindery: Unknown node type: " + child.nodeType);
	            }
	          })();
	        };
	
	        // kick it off
	        addNextChild();
	      };
	
	      state.currentPage = this.addPage();
	      var content = this.source.cloneNode(true);
	      content.style.margin = 0; // TODO: make this clearer
	      this.source.style.display = "none";
	      addElementNode(content, function () {
	        console.log("wow we're done!");
	        document.body.removeChild(_this.measureArea);
	
	        _this.printer.setOrdered();
	
	        if (doneBinding) doneBinding(_this.book);
	      });
	    }
	  }]);
	
	  return Binder;
	}();
	
	var prettyName = function prettyName(node) {
	  return "\"" + node.tagName.toLowerCase() + (node.id ? "#" + node.id : "") + "." + [].concat(_toConsumableArray(node.classList)).join(".") + "\"";
	};
	
	module.exports = Binder;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Book = function () {
	  function Book(opts) {
	    _classCallCheck(this, Book);
	
	    this.pageNum = 1;
	    this.pages = [];
	  }
	
	  _createClass(Book, [{
	    key: "addPage",
	    value: function addPage(page) {
	      page.setNumber(this.pageNum);
	      this.pageNum++;
	      this.pages.push(page);
	    }
	  }]);
	
	  return Book;
	}();
	
	module.exports = Book;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Page = function () {
	  function Page(template) {
	    _classCallCheck(this, Page);
	
	    this.element = template.cloneNode(true);
	    this.flowBox = this.element.querySelector("[bindery-flowbox]");
	    this.flowContent = this.element.querySelector("[bindery-content]");
	    this.footer = this.element.querySelector("[bindery-footer]");
	  }
	
	  _createClass(Page, [{
	    key: "setNumber",
	    value: function setNumber(n) {
	      var num = this.element.querySelector("[bindery-num]");
	      num.textContent = n;
	    }
	  }]);
	
	  return Page;
	}();
	
	module.exports = Page;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _page = __webpack_require__(2);
	
	var _page2 = _interopRequireDefault(_page);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Printer = function () {
	  function Printer(opts) {
	    _classCallCheck(this, Printer);
	
	    this.book = opts.book;
	
	    if (opts.target) {
	      this.target = opts.target;
	      this.target.setAttribute("bindery-export", true);
	    } else {
	      this.target = el("div", { "bindery-export": true });
	      document.body.appendChild(this.target);
	    }
	
	    this.template = opts.template;
	    this.printWrapper = el("div", { "bindery-print-wrapper": true });
	  }
	
	  _createClass(Printer, [{
	    key: "cancel",
	    value: function cancel() {
	      this.target.style.display = "none";
	    }
	  }, {
	    key: "toggleGuides",
	    value: function toggleGuides() {
	      this.target.classList.toggle("bindery-show-guides");
	    }
	  }, {
	    key: "setOrdered",
	    value: function setOrdered() {
	      this.target.style.display = "block";
	
	      if (this.book.pages.length % 2 !== 0) {
	        var pg = new _page2.default(this.template);
	        this.book.addPage(pg);
	      }
	      var spacerPage = new _page2.default(this.template);
	      var spacerPage2 = new _page2.default(this.template);
	      spacerPage.element.style.visibility = "hidden";
	      spacerPage2.element.style.visibility = "hidden";
	      this.book.pages.unshift(spacerPage);
	      this.book.pages.push(spacerPage2);
	
	      for (var i = 0; i < this.book.pages.length; i += 2) {
	        var wrap = this.printWrapper.cloneNode(false);
	        var l = this.book.pages[i].element;
	        var r = this.book.pages[i + 1].element;
	        l.setAttribute("bindery-left", true);
	        r.setAttribute("bindery-right", true);
	        wrap.appendChild(l);
	        wrap.appendChild(r);
	        this.target.appendChild(wrap);
	      }
	    }
	  }, {
	    key: "setInteractive",
	    value: function setInteractive() {
	      if (this.book.pages.length % 2 !== 0) {
	        var pg = new _page2.default(this.template);
	        this.book.addPage(pg);
	      }
	      var spacerPage = new _page2.default(this.template);
	      var spacerPage2 = new _page2.default(this.template);
	      spacerPage.element.style.visibility = "hidden";
	      spacerPage2.element.style.visibility = "hidden";
	      this.book.pages.unshift(spacerPage);
	      this.book.pages.push(spacerPage2);
	
	      for (var i = 0; i < this.book.pages.length; i += 2) {
	        var wrap = this.printWrapper.cloneNode(false);
	        wrap.setAttribute("bindery-preview", true);
	        var l = this.book.pages[i].element;
	        var r = this.book.pages[i + 1].element;
	        l.setAttribute("bindery-left", true);
	        r.setAttribute("bindery-right", true);
	        wrap.appendChild(l);
	        wrap.appendChild(r);
	        this.target.appendChild(wrap);
	      }
	    }
	  }]);
	
	  return Printer;
	}();
	
	exports.default = Printer;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var el = function el(selector, attrs, text) {
	
	  var tags = selector.match(/^([a-zA-Z]+)/g);
	  var ids = selector.match(/#([a-zA-Z0-9\-\_]+)/g);
	  var classes = selector.match(/\.([a-zA-Z0-9\-\_]+)/g);
	
	  var element = document.createElement(tags ? tags[0] : "div");
	
	  if (ids) element.id = ids[0].substr(1);
	  if (classes) element.className = classes.map(function (c) {
	    return c.substr(1);
	  }).join(" ");
	  if (text) element.textContent = text;
	  if (attrs) {
	    for (key in attrs) {
	      element.setAttribute(key, attrs[key]);
	    }
	  }
	
	  return element;
	};
	exports.default = el;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(6);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./bindery.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./bindery.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(7)();
	// imports
	
	
	// module
	exports.push([module.id, "@media screen {\n  [bindery-page] {\n    outline: 1px solid rgba(0,0,0,0.3);\n    background: white;\n    box-shadow: 3px 3px 0 rgba(0,0,0,0.2);\n    overflow: hidden;\n  }\n  .bindery-show-guides [bindery-page] {\n    overflow: visible;\n  }\n  .bindery-show-guides [bindery-page]::after {\n    content: \"\";\n    outline: 1px solid magenta;\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n  }\n\n  [bindery-print-wrapper] {\n    /*box-shadow: 2px 2px 0 rgba(0,0,0,0.8);*/\n  }\n  .bindery-show-guides [bindery-flowbox] {\n    outline: 1px solid cyan;\n  }\n  .bindery-show-guides [bindery-footer] {\n    outline: 1px solid cyan;\n  }\n  .bindery-show-guides [bindery-content] {\n    outline: 1px solid lime;\n  }\n  .bindery-show-guides [bindery-num] {\n    outline: 1px solid cyan;\n  }\n  [bindery-export], .measureArea {\n    background: #eee;\n    padding: 20px;\n  }\n}\n\n@media print {\n  [bindery-print-wrapper] {\n    border: 1px dashed black;\n    margin: 20px;\n  }\n  [bindery-controls] {\n    display: none;\n  }\n}\n\n.measureArea {\n  outline: 1px solid cyan;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n\n.measureArea p {\n  outline: 1px solid cyan;\n  /*color: cyan;*/\n}\n\n[bindery-print-wrapper] {\n  page-break-after: always;\n  display: flex;\n  width: 800px;\n  margin: 20px auto;\n}\n\n[bindery-page] {\n  width: 400px;\n  height: 600px;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  flex-wrap: nowrap;\n  margin: auto;\n}\n\n[bindery-flowbox] {\n  margin: 40px;\n  margin-bottom: 0;\n  flex: 1 1 auto;\n  min-height: 0;\n}\n\n[bindery-footer] {\n  margin: 40px;\n  margin-top: 4px;\n  flex: 0 1 auto;\n  font-size: 0.66em;\n}\n\n.bleed [bindery-flowbox] {\n  margin: 0;\n  position: absolute;\n  top: -20px;\n  bottom: -20px;\n}\n[bindery-left].bleed [bindery-flowbox] {\n  right: 0;\n  left: -20px;\n}\n[bindery-right].bleed [bindery-flowbox] {\n  left: 0;\n  right: -20px;\n}\n\n[bindery-num] {\n  position: absolute;\n  text-align: center;\n  bottom: 20px;\n}\n[bindery-left] [bindery-num] {\n  left: 20px;\n}\n[bindery-right] [bindery-num] {\n  right: 20px;\n}\n\n\n[bindery-preview] {\n  perspective: 1200px;\n  /*width: 60px;*/\n  height: 0;\n  width: 0;\n}\n[bindery-preview] [bindery-page] {\n  position: absolute;\n}\n[bindery-preview] [bindery-left] {\n  transform: rotateY(50deg);\n}\n[bindery-preview] [bindery-right] {\n  transform: rotateY(-50deg);\n}\n\n\n[bindery-continuation] {\n  text-indent: 0 !important;\n}\n\n[bindery-controls] {\n  position: fixed;\n  bottom: 20px;\n  left: 0;\n  right: 0;\n  padding: 12px;\n  z-index: 99;\n  width: 600px;\n  margin: auto;\n  background: rgba(50,50,50,0.9);\n  outline: 1px solid rgba(0,0,0,0.3);\n  border-radius: 4px;\n}\n_::-webkit-:-webkit-full-screen:host:not(:root:root), [bindery-controls] {\n  background: rgba(0,0,0,0.5);\n  -webkit-backdrop-filter: blur(20px);\n}\n\n[bindery-btn] {\n  color: black;\n  -webkit-appearance: none;\n  border: none;\n  background: white;\n  padding: 6px 10px;\n  border: 1px solid rgba(0,0,0,0.3);\n  cursor: pointer;\n  font-size: 14px;\n  border-radius: 2px;\n}\n[bindery-btn]:focus {\n  /*outline: 1px solid blue;*/\n}\n[bindery-btn]:hover {\n  /*background: black;\n  color: white;*/\n  box-shadow: 2px 2px 0px rgba(0,0,0,0.2);\n}\n[bindery-btn]:active {\n  box-shadow: 0 0 0;\n  background: rgba(0,0,0,0.04);\n}\n", ""]);
	
	// exports


/***/ },
/* 7 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ]);
//# sourceMappingURL=bindery.js.map