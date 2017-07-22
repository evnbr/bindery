var Bindery =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BinderyRule = function BinderyRule() {
  var _this = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, BinderyRule);

  this.name = options.name ? options.name : 'Unnamed Bindery Rule';
  this.selector = '';

  Object.keys(options).forEach(function (key) {
    _this[key] = options[key];
  });
};

exports.default = BinderyRule;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var split = __webpack_require__(8)
var ClassList = __webpack_require__(9)

var w = typeof window === 'undefined' ? __webpack_require__(11) : window
var document = w.document
var Text = w.Text

function context () {

  var cleanupFuncs = []

  function h() {
    var args = [].slice.call(arguments), e = null
    function item (l) {
      var r
      function parseClass (string) {
        // Our minimal parser doesn’t understand escaping CSS special
        // characters like `#`. Don’t use them. More reading:
        // https://mathiasbynens.be/notes/css-escapes .

        var m = split(string, /([\.#]?[^\s#.]+)/)
        if(/^\.|#/.test(m[1]))
          e = document.createElement('div')
        forEach(m, function (v) {
          var s = v.substring(1,v.length)
          if(!v) return
          if(!e)
            e = document.createElement(v)
          else if (v[0] === '.')
            ClassList(e).add(s)
          else if (v[0] === '#')
            e.setAttribute('id', s)
        })
      }

      if(l == null)
        ;
      else if('string' === typeof l) {
        if(!e)
          parseClass(l)
        else
          e.appendChild(r = document.createTextNode(l))
      }
      else if('number' === typeof l
        || 'boolean' === typeof l
        || l instanceof Date
        || l instanceof RegExp ) {
          e.appendChild(r = document.createTextNode(l.toString()))
      }
      //there might be a better way to handle this...
      else if (isArray(l))
        forEach(l, item)
      else if(isNode(l))
        e.appendChild(r = l)
      else if(l instanceof Text)
        e.appendChild(r = l)
      else if ('object' === typeof l) {
        for (var k in l) {
          if('function' === typeof l[k]) {
            if(/^on\w+/.test(k)) {
              (function (k, l) { // capture k, l in the closure
                if (e.addEventListener){
                  e.addEventListener(k.substring(2), l[k], false)
                  cleanupFuncs.push(function(){
                    e.removeEventListener(k.substring(2), l[k], false)
                  })
                }else{
                  e.attachEvent(k, l[k])
                  cleanupFuncs.push(function(){
                    e.detachEvent(k, l[k])
                  })
                }
              })(k, l)
            } else {
              // observable
              e[k] = l[k]()
              cleanupFuncs.push(l[k](function (v) {
                e[k] = v
              }))
            }
          }
          else if(k === 'style') {
            if('string' === typeof l[k]) {
              e.style.cssText = l[k]
            }else{
              for (var s in l[k]) (function(s, v) {
                if('function' === typeof v) {
                  // observable
                  e.style.setProperty(s, v())
                  cleanupFuncs.push(v(function (val) {
                    e.style.setProperty(s, val)
                  }))
                } else
                  var match = l[k][s].match(/(.*)\W+!important\W*$/);
                  if (match) {
                    e.style.setProperty(s, match[1], 'important')
                  } else {
                    e.style.setProperty(s, l[k][s])
                  }
              })(s, l[k][s])
            }
          } else if(k === 'attrs') {
            for (var v in l[k]) {
              e.setAttribute(v, l[k][v])
            }
          }
          else if (k.substr(0, 5) === "data-") {
            e.setAttribute(k, l[k])
          } else {
            e[k] = l[k]
          }
        }
      } else if ('function' === typeof l) {
        //assume it's an observable!
        var v = l()
        e.appendChild(r = isNode(v) ? v : document.createTextNode(v))

        cleanupFuncs.push(l(function (v) {
          if(isNode(v) && r.parentElement)
            r.parentElement.replaceChild(v, r), r = v
          else
            r.textContent = v
        }))
      }

      return r
    }
    while(args.length)
      item(args.shift())

    return e
  }

  h.cleanup = function () {
    for (var i = 0; i < cleanupFuncs.length; i++){
      cleanupFuncs[i]()
    }
    cleanupFuncs.length = 0
  }

  return h
}

var h = module.exports = context()
h.context = context

function isNode (el) {
  return el && el.nodeName && el.nodeType
}

function forEach (arr, fn) {
  if (arr.forEach) return arr.forEach(fn)
  for (var i = 0; i < arr.length; i++) fn(arr[i], i)
}

function isArray (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]'
}




/***/ }),
/* 2 */
/***/ (function(module, exports) {

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


/***/ }),
/* 3 */
/***/ (function(module, exports) {

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
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(12);
__webpack_require__(14);

var Page = function () {
  function Page() {
    _classCallCheck(this, Page);

    this.flowContent = (0, _hyperscript2.default)('.bindery-content');
    this.flowBox = (0, _hyperscript2.default)('.bindery-flowbox', this.flowContent);
    this.footer = (0, _hyperscript2.default)('.bindery-footer');
    this.bleed = (0, _hyperscript2.default)('.bindery-bleed');
    this.element = (0, _hyperscript2.default)('.bindery-page', { style: Page.sizeStyle() }, this.bleed, this.flowBox, this.footer);
  }

  _createClass(Page, [{
    key: 'overflowAmount',
    value: function overflowAmount() {
      if (this.element.offsetParent === null) {
        var measureArea = document.querySelector('.bindery-measure-area');
        if (!measureArea) measureArea = document.body.appendChild((0, _hyperscript2.default)('.bindery-measure-area'));

        if (this.element.parentNode !== measureArea) {
          measureArea.innerHTML = '';
          measureArea.appendChild(this.element);
        }
      }
      var contentH = this.flowContent.getBoundingClientRect().height;
      var boxH = this.flowBox.getBoundingClientRect().height;

      if (boxH === 0) {
        console.error('Bindery: Trying to flow into a box of zero height.');
      }

      return contentH - boxH;
    }
  }, {
    key: 'hasOverflowed',
    value: function hasOverflowed() {
      return this.overflowAmount() > -5;
    }
  }, {
    key: 'setLeftRight',
    value: function setLeftRight(dir) {
      if (dir === 'left') {
        this.side = dir;
        this.element.classList.remove('bindery-right');
        this.element.classList.add('bindery-left');
      } else if (dir === 'right') {
        this.side = dir;
        this.element.classList.remove('bindery-left');
        this.element.classList.add('bindery-right');
      } else {
        throw Error('Bindery: Setting page to invalid direction' + dir);
      }
    }
  }, {
    key: 'setPreference',
    value: function setPreference(dir) {
      if (dir === 'left') this.alwaysLeft = true;
      if (dir === 'right') this.alwaysRight = true;
    }
  }, {
    key: 'setOutOfFlow',
    value: function setOutOfFlow(bool) {
      this.outOfFlow = bool;
    }
  }, {
    key: 'clone',
    value: function clone() {
      var newPage = new Page();
      newPage.flowContent.innerHTML = this.flowContent.cloneNode(true).innerHTML;
      newPage.footer.innerHTML = this.footer.cloneNode(true).innerHTML;
      newPage.flowContent.insertAdjacentHTML('beforeend', 'RESTORED');
      return newPage;
    }
  }], [{
    key: 'isSizeValid',
    value: function isSizeValid() {
      document.body.classList.remove('bindery-viewing');

      var testPage = new Page();
      var measureArea = document.querySelector('.bindery-measure-area');
      if (!measureArea) measureArea = document.body.appendChild((0, _hyperscript2.default)('.bindery-measure-area'));

      measureArea.innerHTML = '';
      measureArea.appendChild(testPage.element);
      var box = testPage.flowBox.getBoundingClientRect();

      measureArea.parentNode.removeChild(measureArea);

      return box.height > 100 && box.width > 100; // TODO: Number is arbitrary
    }
  }, {
    key: 'setSize',
    value: function setSize(size) {
      Page.W = size.width;
      Page.H = size.height;
    }
  }, {
    key: 'sizeStyle',
    value: function sizeStyle() {
      return {
        height: '' + Page.H + Page.unit,
        width: '' + Page.W + Page.unit
      };
    }
  }, {
    key: 'spreadSizeStyle',
    value: function spreadSizeStyle() {
      return {
        height: '' + Page.H + Page.unit,
        width: '' + Page.W * 2 + Page.unit
      };
    }
  }, {
    key: 'setMargin',
    value: function setMargin(margin) {
      var sheet = void 0;
      var existing = document.querySelector('#bindery-margin-stylesheet');
      if (existing) {
        sheet = existing;
      } else {
        sheet = document.createElement('style');
        sheet.id = 'bindery-margin-stylesheet';
      }
      sheet.innerHTML = '\n      .bindery-flowbox,\n      .bindery-footer {\n        margin-left: ' + margin.inner + Page.unit + ';\n        margin-right: ' + margin.outer + Page.unit + ';\n      }\n      .bindery-left .bindery-flowbox,\n      .bindery-left .bindery-footer {\n        margin-left: ' + margin.outer + Page.unit + ';\n        margin-right: ' + margin.inner + Page.unit + ';\n      }\n      .bindery-flowbox { margin-top: ' + margin.top + Page.unit + '; }\n      .bindery-footer { margin-bottom: ' + margin.bottom + Page.unit + '; }\n    ';
      document.head.appendChild(sheet);
    }
  }]);

  return Page;
}();

exports.default = Page;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _paginate = __webpack_require__(6);

var _paginate2 = _interopRequireDefault(_paginate);

var _page = __webpack_require__(4);

var _page2 = _interopRequireDefault(_page);

var _viewer = __webpack_require__(16);

var _viewer2 = _interopRequireDefault(_viewer);

var _controls = __webpack_require__(21);

var _controls2 = _interopRequireDefault(_controls);

var _Rules = __webpack_require__(28);

var _Rules2 = _interopRequireDefault(_Rules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_PAGE_UNIT = 'in';
var DEFAULT_PAGE_SIZE = {
  width: 4,
  height: 6
};
var DEFAULT_PAGE_MARGIN = {
  inner: 0.2,
  outer: 0.2,
  bottom: 0.2,
  top: 0.2
};
// const DEFAULT_BLEED = {
//   inner: 0,
//   outer: 0.2,
//   bottom: 0.2,
//   top: 0.2,
// };

var arraysEqual = function arraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (var i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

var Binder = function () {
  function Binder(opts) {
    var _this = this;

    _classCallCheck(this, Binder);

    var pageSize = opts.pageSize ? opts.pageSize : DEFAULT_PAGE_SIZE;
    var pageMargin = opts.pageMargin ? opts.pageMargin : DEFAULT_PAGE_MARGIN;
    this.pageUnit = opts.pageUnit ? opts.pageUnit : DEFAULT_PAGE_UNIT;
    this.setSize(pageSize);
    this.setMargin(pageMargin);

    this.viewer = new _viewer2.default();
    if (opts.startingViewMode) {
      this.viewer.setMode(opts.startingViewMode);
    }

    this.rules = [];
    if (opts.rules) this.addRules(opts.rules);

    if (opts.standalone) {
      this.runImmeditately = true;
    }

    this.debugDelay = opts.debugDelay ? opts.debugDelay : 0;

    if (!opts.source) {
      this.viewer.displayError('Source not specified', 'You must include a source element, selector, or url');
      console.error('Bindery: You must include a source element or selector');
    } else if (typeof opts.source === 'string') {
      this.source = document.querySelector(opts.source);
      if (!(this.source instanceof HTMLElement)) {
        this.viewer.displayError('Source not specified', 'Could not find element that matches selector "' + opts.source + '"');
        console.error('Bindery: Could not find element that matches selector "' + opts.source + '"');
        return;
      }
      if (this.runImmeditately) {
        this.makeBook();
      }
    } else if (_typeof(opts.source) === 'object' && opts.source.url) {
      var url = opts.source.url;
      var selector = opts.source.selector;
      fetch(opts.source.url).then(function (response) {
        if (response.status === 404) {
          _this.viewer.displayError('404', 'Could not find file at "' + url + '"');
        } else if (response.status === 200) {
          return response.text();
        }
        return '';
      }).then(function (fetchedContent) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = fetchedContent;
        _this.source = wrapper.querySelector(selector);
        if (!(_this.source instanceof HTMLElement)) {
          _this.viewer.displayError('Source not specified', 'Could not find element that matches selector "' + selector + '"');
          console.error('Bindery: Could not find element that matches selector "' + selector + '"');
          return;
        }
        if (_this.runImmeditately) {
          _this.makeBook();
        }
      }).catch(function (error) {
        console.error(error);
        var scheme = window.location.href.split('://')[0];
        if (scheme === 'file') {
          _this.viewer.displayError('Can\'t fetch content from "' + url + '"', 'Web pages can\'t fetch content unless they are on a server.');
          // alert(`Can't fetch content from "${url}". Web pages can't fetch content
          // unless they are on a server. \n\n What you can do: \n 1. Include the content
          // you need on this page, or \n 2. Put this page on your server,
          // or \n 3. Run a local server`);
        }
      });
    } else if (opts.source instanceof HTMLElement) {
      this.source = opts.source;
      if (this.runImmeditately) {
        this.makeBook();
      }
    } else {
      console.error('Bindery: Source must be an element or selector');
    }
  }

  _createClass(Binder, [{
    key: 'cancel',
    value: function cancel() {
      this.stopCheckingLayout();
      this.viewer.cancel();
      document.body.classList.remove('bindery-viewing');
      this.source.style.display = '';
    }
  }, {
    key: 'setSize',
    value: function setSize(size) {
      _page2.default.unit = this.pageUnit;
      this.pageSize = size;
      _page2.default.setSize(size);
    }
  }, {
    key: 'setMargin',
    value: function setMargin(margin) {
      _page2.default.unit = this.pageUnit;
      this.pageMargin = margin;
      _page2.default.setMargin(margin);
    }
  }, {
    key: 'isSizeValid',
    value: function isSizeValid() {
      return _page2.default.isSizeValid();
    }
  }, {
    key: 'addRules',
    value: function addRules(newRules) {
      var _this2 = this;

      newRules.forEach(function (rule) {
        if (rule instanceof _Rules2.default.BinderyRule) {
          _this2.rules.push(rule);
        } else {
          console.warn('Bindery: The following is not an instance of BinderyRule and will be ignored:');
          console.warn(rule);
        }
      });
    }
  }, {
    key: 'makeBook',
    value: function makeBook(doneBinding) {
      var _this3 = this;

      if (!this.source) {
        document.body.classList.add('bindery-viewing');
        return;
      }

      if (!this.isSizeValid()) {
        var u = this.pageUnit;
        var w = this.pageSize.width + u;
        var h = this.pageSize.height + u;
        var size = '{ width: ' + w + ', height: ' + h + ' }';
        var i = this.pageMargin.inner + u;
        var o = this.pageMargin.outer + u;
        var t = this.pageMargin.top + u;
        var b = this.pageMargin.bottom + u;
        var margin = '{ top: ' + t + ', inner: ' + i + ', outer: ' + o + ', bottom: ' + b + ' }';
        this.viewer.displayError('Page is too small', 'Size: ' + size + ' \n Margin: ' + margin + ' \n Try adjusting the sizes or units.');
        console.error('Bindery: Cancelled pagination. Page is too small.');
        return;
      }

      this.stopCheckingLayout();

      this.source.style.display = '';
      var content = this.source.cloneNode(true);
      this.source.style.display = 'none';

      // In case we're updating an existing layout
      document.body.classList.remove('bindery-viewing');
      document.body.classList.add('bindery-inProgress');

      if (!this.controls) {
        this.controls = new _controls2.default({ binder: this });
      }

      this.controls.setInProgress();

      (0, _paginate2.default)(content, this.rules,
      // Done
      function (pages) {
        setTimeout(function () {
          _this3.viewer.pages = pages;
          _this3.viewer.update();

          _this3.controls.setDone();
          if (doneBinding) doneBinding();
          document.body.classList.remove('bindery-inProgress');
          _this3.startCheckingLayout();
        }, 100);
      },
      // Progress
      function (pageCount) {
        _this3.controls.updateProgress(pageCount);
      },
      // Error
      function () {}, this.debugDelay);
    }
  }, {
    key: 'startCheckingLayout',
    value: function startCheckingLayout() {
      var _this4 = this;

      this.layoutChecker = setInterval(function () {
        _this4.checkLayoutChange();
      }, 500);
    }
  }, {
    key: 'stopCheckingLayout',
    value: function stopCheckingLayout() {
      if (this.layoutChecker) {
        clearInterval(this.layoutChecker);
        this.pageOverflows = null;
      }
    }
  }, {
    key: 'checkLayoutChange',
    value: function checkLayoutChange() {
      if (this.viewer.mode !== 'grid') return;
      if (!this.pageOverflows) {
        this.pageOverflows = this.getPageOverflows();
        return;
      }

      var newOverflows = this.getPageOverflows();
      if (!arraysEqual(newOverflows, this.pageOverflows)) {
        // console.info("Layout changed");
        this.throttledUpdateBook();
        this.pageOverflows = newOverflows;
      }
    }
  }, {
    key: 'throttledUpdateBook',
    value: function throttledUpdateBook() {
      var _this5 = this;

      if (this.makeBookTimer) clearTimeout(this.makeBookTimer);
      this.makeBookTimer = setTimeout(function () {
        _this5.makeBook();
      }, 500);
    }
  }, {
    key: 'getPageOverflows',
    value: function getPageOverflows() {
      return this.viewer.pages.map(function (page) {
        return page.overflowAmount();
      });
    }
  }]);

  return Binder;
}();

Object.keys(_Rules2.default).forEach(function (rule) {
  Binder[rule] = _Rules2.default[rule];
});

module.exports = Binder;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elementToString = __webpack_require__(7);

var _elementToString2 = _interopRequireDefault(_elementToString);

var _page = __webpack_require__(4);

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var last = function last(arr) {
  return arr[arr.length - 1];
};

// TODO: only do this if not double sided?
var reorderPages = function reorderPages(pages) {
  var orderedPages = pages;

  // TODO: this ignores the cover page, assuming its on the right
  for (var i = 1; i < orderedPages.length - 1; i += 2) {
    var left = orderedPages[i];

    // TODO: Check more than once
    if (left.alwaysRight) {
      if (left.outOfFlow) {
        orderedPages[i] = pages[i + 1];
        orderedPages[i + 1] = left;
      } else {
        pages.splice(i, 0, new _page2.default());
      }
    }

    var right = orderedPages[i + 1];

    if (right.alwaysLeft) {
      if (right.outOfFlow) {
        // TODO: don't overflow, assumes that
        // there are not multiple spreads in a row
        orderedPages[i + 1] = pages[i + 3];
        orderedPages[i + 3] = right;
      } else {
        pages.splice(i + 1, 0, new _page2.default());
      }
    }
  }

  return orderedPages;
};

var clonePath = function clonePath(origPath) {
  var newPath = [];
  for (var i = origPath.length - 1; i >= 0; i -= 1) {
    var clone = origPath[i].cloneNode(false); // shallow
    clone.innerHTML = '';
    clone.setAttribute('bindery-continuation', true);
    if (clone.id) {
      console.warn('Bindery: Added a break to ' + (0, _elementToString2.default)(clone) + ', so "' + clone.id + '" is no longer a unique ID.');
    }
    if (i < origPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }
  return newPath;
};

var paginate = function paginate(content, rules, paginateDoneCallback, paginateProgressCallback, paginateErrorCallback, DELAY) {
  var state = {
    path: [], // Stack representing which element we're currently inside
    pages: []
  };

  // Even when there is no debugDelay,
  // the throttler will occassionally use rAF
  // to prevent the call stack from getting too big.
  //
  // There might be a better way to do this.
  var MAX_CALLS = 1000;
  var numberOfCalls = 0;
  var throttle = function throttle(func) {
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

  var newPageRules = function newPageRules(pg) {
    rules.forEach(function (rule) {
      if (rule.afterPageCreated) rule.afterPageCreated(pg, state);
    });
  };
  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  var makeNextPage = function makeNextPage() {
    if (state.currentPage && state.currentPage.hasOverflowed()) {
      console.warn('Bindery: Moved to new page when last one is still overflowing', state.currentPage.element);
    }
    if (state.pages.length === 500) {
      console.warn('Bindery: More than 500 pages, performance may be slow.');
    } else if (state.pages.length === 1000) {
      console.warn('Bindery: More than 1000 pages, performance may be slow.');
    }

    state.path = clonePath(state.path);
    var newPage = new _page2.default();
    newPage.creationOrder = state.pages.length;
    newPageRules(newPage);
    state.pages.push(newPage);
    state.currentPage = newPage; // TODO redundant
    if (state.path[0]) {
      newPage.flowContent.appendChild(state.path[0]);
    }

    // make sure the cloned page is valid.
    if (newPage.hasOverflowed()) {
      var suspect = last(state.path);
      if (suspect) {
        console.error('Bindery: NextPage already overflowing, probably due to a style set on ' + (0, _elementToString2.default)(suspect) + '. It may not fit on the page.');
        suspect.parentNode.removeChild(suspect);
      } else {
        console.error('Bindery: NextPage already overflowing.');
      }
    }

    paginateProgressCallback(state.pages.length);

    return newPage;
  };

  var beforeAddRules = function beforeAddRules(elmt) {
    rules.forEach(function (rule) {
      if (!rule.selector) return;
      if (elmt.matches(rule.selector) && rule.beforeAdd) {
        var backupPg = state.currentPage.clone();
        var backupElmt = elmt.cloneNode(true);
        rule.beforeAdd(elmt, state, makeNextPage);

        if (state.currentPage.hasOverflowed()) {
          console.log('restoring from backup');
          // restore from backup
          elmt.innerHTML = backupElmt.innerHTML; // TODO: make less hacky

          var idx = state.pages.indexOf(state.currentPage);
          state.pages[idx] = backupPg;
          state.currentPage = backupPg;

          state.currentPage = makeNextPage();

          rule.beforeAdd(elmt, state, makeNextPage);
        }
      }
    });
  };
  var afterAddRules = function afterAddRules(elmt) {
    rules.forEach(function (rule) {
      if (!rule.selector) return;
      if (elmt.matches(rule.selector) && rule.afterAdd) {
        rule.afterAdd(elmt, state, makeNextPage);
      }
    });
  };
  var afterBindRules = function afterBindRules(pages) {
    rules.forEach(function (rule) {
      if (rule.afterBind) {
        pages.forEach(function (pg, i, arr) {
          rule.afterBind(pg, i, arr.length);
        });
      }
    });
  };

  var moveNodeToNextPage = function moveNodeToNextPage(nodeToMove) {
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
  var addTextNode = function addTextNode(originalNode, doneCallback, abortCallback) {
    var textNode = originalNode;
    var origText = textNode.nodeValue;
    last(state.path).appendChild(textNode);

    var lastPos = 0;
    var pos = origText.length / 2;

    var step = function step() {
      var dist = Math.abs(lastPos - pos);

      if (pos > origText.length - 1) {
        throttle(doneCallback);
        return;
      }
      textNode.nodeValue = origText.substr(0, pos);

      if (dist < 1) {
        // Is done
        // Back out to word boundary
        while (origText.charAt(pos) !== ' ' && pos > -1) {
          pos -= 1;
        }if (pos < 1 && origText.trim().length > 0) {
          // console.error(`Bindery: Aborted adding "${origText.substr(0,25)}..."`);
          textNode.nodeValue = origText;
          abortCallback();
          return;
        }

        var fittingText = origText.substr(0, pos);
        var overflowingText = origText.substr(pos);
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

      var hasOverflowed = state.currentPage.hasOverflowed();
      pos += (hasOverflowed ? -dist : dist) / 2;

      throttle(step);
    };

    if (state.currentPage.hasOverflowed()) {
      step(); // find breakpoint
    } else throttle(doneCallback); // add in one go
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  var addElementNode = function addElementNode(node, doneCallback) {
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
    var childNodes = [].concat(_toConsumableArray(node.childNodes));
    // 2. Clear this node
    node.innerHTML = '';

    // 3. Try adding each child one by one
    var index = 0;
    var addNextChild = function addNextChild() {
      if (!(index < childNodes.length)) {
        doneCallback();
        return;
      }
      var child = childNodes[index];
      index += 1;

      switch (child.nodeType) {
        case Node.TEXT_NODE:
          {
            var abortCallback = function abortCallback() {
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
        case Node.ELEMENT_NODE:
          {
            if (child.tagName === 'SCRIPT') {
              addNextChild(); // skip
              break;
            }

            beforeAddRules(child);

            throttle(function () {
              addElementNode(child, function () {
                var addedChild = state.path.pop(); // WHYY
                // let addedChild = last(state.path);
                // TODO: AfterAdd rules may want to access original child, not split second half
                afterAddRules(addedChild);
                addNextChild();
              });
            });
            break;
          }
        default:
          console.log('Bindery: Unknown node type: ' + child.nodeType);
          addNextChild(); // skip
      }
    };

    // kick it off
    addNextChild();
  };

  state.currentPage = makeNextPage();
  content.style.margin = 0;
  content.style.padding = 0;

  addElementNode(content, function () {
    console.log('Bindery: Pages created in ' + 2 + 'ms');
    var measureArea = document.querySelector('.bindery-measure-area');
    document.body.removeChild(measureArea);

    var orderedPages = reorderPages(state.pages);

    var facingPages = true; // TODO: Pass in facingpages options
    if (facingPages) {
      orderedPages.forEach(function (page, i) {
        page.setLeftRight(i % 2 === 0 ? 'right' : 'left');
      });
    } else {
      orderedPages.forEach(function (page) {
        page.setLeftRight('right');
      });
    }
    afterBindRules(orderedPages);

    paginateDoneCallback(orderedPages);
  });
};

exports.default = paginate;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var elementToString = function elementToString(node) {
  var tag = node.tagName.toLowerCase();
  var id = node.id ? '#' + node.id : '';

  var classes = '';
  if (node.classList.length > 0) {
    classes = '.' + [].concat(_toConsumableArray(node.classList)).join('.');
  }

  var text = '';
  if (id.length < 1 && classes.length < 2) {
    text = '("' + node.textContent.substr(0, 20).replace(/\s+/g, ' ') + '...")';
  }
  return tag + id + classes + text;
};

exports.default = elementToString;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// contains, add, remove, toggle
var indexof = __webpack_require__(10)

module.exports = ClassList

function ClassList(elem) {
    var cl = elem.classList

    if (cl) {
        return cl
    }

    var classList = {
        add: add
        , remove: remove
        , contains: contains
        , toggle: toggle
        , toString: $toString
        , length: 0
        , item: item
    }

    return classList

    function add(token) {
        var list = getTokens()
        if (indexof(list, token) > -1) {
            return
        }
        list.push(token)
        setTokens(list)
    }

    function remove(token) {
        var list = getTokens()
            , index = indexof(list, token)

        if (index === -1) {
            return
        }

        list.splice(index, 1)
        setTokens(list)
    }

    function contains(token) {
        return indexof(getTokens(), token) > -1
    }

    function toggle(token) {
        if (contains(token)) {
            remove(token)
            return false
        } else {
            add(token)
            return true
        }
    }

    function $toString() {
        return elem.className
    }

    function item(index) {
        var tokens = getTokens()
        return tokens[index] || null
    }

    function getTokens() {
        var className = elem.className

        return filter(className.split(" "), isTruthy)
    }

    function setTokens(list) {
        var length = list.length

        elem.className = list.join(" ")
        classList.length = length

        for (var i = 0; i < list.length; i++) {
            classList[i] = list[i]
        }

        delete list[length]
    }
}

function filter (arr, fn) {
    var ret = []
    for (var i = 0; i < arr.length; i++) {
        if (fn(arr[i])) ret.push(arr[i])
    }
    return ret
}

function isTruthy(value) {
    return !!value
}


/***/ }),
/* 10 */
/***/ (function(module, exports) {


var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

/***/ }),
/* 11 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(13);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(3)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./page.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./page.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "@media screen {\n  .bindery-page {\n    background: white;\n    outline: 1px solid rgba(0,0,0,0.1);\n    box-shadow: 0px 1px 3px rgba(0,0,0,0.2);\n    overflow: hidden;\n  }\n  .bindery-show-bleed .bindery-page {\n    box-shadow: none;\n    outline: none;\n    overflow: visible;\n  }\n  .bindery-page3d .bindery-page {\n    overflow: hidden !important;\n  }\n\n\n  .bindery-page::after {\n    content: \"\";\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    pointer-events: none;\n  }\n\n  /*.bindery-show-bleed .bindery-page::after {\n    outline: 1px solid rgba(0,0,0,0.2);\n    box-shadow: 0px 1px 3px rgba(0,0,0,0.3);\n  }*/\n\n  .bindery-show-guides .bindery-page::after {\n    outline: 1px solid magenta;\n  }\n\n  .bindery-show-guides .bindery-flowbox {\n    outline: 1px solid cyan;\n  }\n  .bindery-show-guides .bindery-footer {\n    outline: 1px solid cyan;\n  }\n  .bindery-show-guides .bindery-content {\n    box-shadow: inset 0 0 0 1px blue;\n  }\n  .bindery-show-guides .bindery-bleed {\n    outline: 1px solid yellow;\n  }\n\n}\n\n.bindery-page {\n  /*width: 400px;*/\n  /*height: 600px;*/\n  width: 200px;\n  height: 300px;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  flex-wrap: nowrap;\n  margin: auto;\n}\n\n.bindery-flowbox {\n  position: relative;\n  margin: 60px 40px;\n  margin-bottom: 0;\n  flex: 1 1 auto;\n  min-height: 0;\n}\n\n.bindery-footer {\n  margin: 60px 40px;\n  margin-top: 4px;\n  flex: 0 1 auto;\n  font-size: 0.5rem;\n  font-family: Verdana, sans-serif;\n}\n\n[bindery-continuation] {\n  text-indent: 0 !important;\n  margin-top: 0 !important;\n}\n\n/*Old Bleed Stuff*/\n.bindery-page.bleed .bindery-flowbox {\n  margin: 0;\n  position: absolute;\n  top: -20px;\n  bottom: -20px;\n}\n.bindery-left.bleed .bindery-flowbox {\n  right: 0;\n  left: -20px;\n}\n.bindery-right.bleed .bindery-flowbox {\n  left: 0;\n  right: -20px;\n}\n\n/*Bleed as layer*/\n.bindery-bleed {\n  position: absolute;\n  top: -0.2in;\n  bottom: -0.2in;\n  z-index: 0;\n}\n.bindery-left .bindery-bleed {\n  right: 0;\n  left: -0.2in;\n}\n.bindery-right .bindery-bleed {\n  left: 0;\n  right: -0.2in;\n}\n", ""]);

// exports


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(15);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(3)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./measureArea.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./measureArea.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, ".bindery-measure-area {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n", ""]);

// exports


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _page = __webpack_require__(4);

var _page2 = _interopRequireDefault(_page);

var _error = __webpack_require__(17);

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(18);

var Viewer = function () {
  function Viewer() {
    var _this = this;

    _classCallCheck(this, Viewer);

    this.pages = [];

    this.doubleSided = true;
    this.twoUp = false;

    this.mode = 'grid';
    this.currentLeaf = 0;

    this.export = (0, _hyperscript2.default)('.bindery-export');
    this.export.setAttribute('bindery-export', true);

    // Automatically switch into print mode
    if (window.matchMedia) {
      var mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener(function (mql) {
        if (mql.matches) {
          _this.setPrint();
        } else {
          // after print
        }
      });
    }
  }

  _createClass(Viewer, [{
    key: 'displayError',
    value: function displayError(title, text) {
      if (!this.export.parentNode) {
        document.body.appendChild(this.export);
      }
      if (!this.error) {
        this.export.innerHTML = '';
        this.error = (0, _error2.default)(title, text);
        this.export.appendChild(this.error);
      }
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      // TODO this doesn't work if the target is an existing node
      if (this.export.parentNode) {
        this.export.parentNode.removeChild(this.export);
      }
    }
  }, {
    key: 'toggleGuides',
    value: function toggleGuides() {
      this.export.classList.toggle('bindery-show-guides');
    }
  }, {
    key: 'toggleBleed',
    value: function toggleBleed() {
      this.export.classList.add('bindery-show-bleed');
    }
  }, {
    key: 'toggleDouble',
    value: function toggleDouble() {
      this.doubleSided = !this.doubleSided;
      this.update();
    }
  }, {
    key: 'setMode',
    value: function setMode(newMode) {
      switch (newMode) {
        case 'grid':
        case 'standard':
        case 'default':
          this.mode = 'grid';
          break;
        case 'interactive':
        case 'preview':
        case '3d':
          this.mode = 'interactive';
          break;
        case 'print':
          this.mode = 'print';
          break;
        default:
          console.error('Bindery: Unknown view mode "' + newMode + '"');
          break;
      }
    }
  }, {
    key: 'setGrid',
    value: function setGrid() {
      this.mode = 'grid';
      this.update();
    }
  }, {
    key: 'setPrint',
    value: function setPrint() {
      this.mode = 'print';
      this.update();
    }
  }, {
    key: 'setInteractive',
    value: function setInteractive() {
      this.mode = 'interactive';
      this.export.classList.remove('bindery-show-bleed');
      this.update();
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this.export.parentNode) {
        document.body.appendChild(this.export);
      }

      document.body.classList.add('bindery-viewing');

      if (this.mode === 'grid') {
        this.renderGrid();
      } else if (this.mode === 'interactive') {
        this.renderInteractive();
      } else if (this.mode === 'print') {
        this.renderPrint();
      } else {
        this.renderGrid();
      }
    }
  }, {
    key: 'renderPrint',
    value: function renderPrint() {
      this.mode = 'print';
      this.export.style.display = 'block';
      this.export.classList.add('bindery-show-bleed');

      this.export.innerHTML = '';

      var pages = this.pages.slice();

      if (this.twoUp) {
        if (this.pages.length % 2 !== 0) {
          var pg = new _page2.default();
          pages.push(pg);
        }
        var spacerPage = new _page2.default();
        var spacerPage2 = new _page2.default();
        spacerPage.element.style.visibility = 'hidden';
        spacerPage2.element.style.visibility = 'hidden';
        pages.unshift(spacerPage);
        pages.push(spacerPage2);
      }

      for (var i = 0; i < pages.length; i += this.twoUp ? 2 : 1) {
        if (this.twoUp) {
          var left = pages[i];
          var right = pages[i + 1];

          var leftPage = left.element;
          var rightPage = right.element;

          var wrap = (0, _hyperscript2.default)('.bindery-print-page', (0, _hyperscript2.default)('.bindery-spread-wrapper', {
            style: _page2.default.spreadSizeStyle()
          }, leftPage, rightPage));

          this.export.appendChild(wrap);
        } else {
          var _pg = pages[i].element;
          var _wrap = (0, _hyperscript2.default)('.bindery-print-page', (0, _hyperscript2.default)('.bindery-spread-wrapper', {
            style: _page2.default.sizeStyle()
          }, _pg));
          this.export.appendChild(_wrap);
        }
      }
    }
  }, {
    key: 'renderGrid',
    value: function renderGrid() {
      this.mode = 'grid';
      this.export.style.display = 'block';
      this.export.classList.remove('bindery-show-bleed');

      this.export.innerHTML = '';

      var pages = this.pages.slice();

      if (this.doubleSided) {
        if (this.pages.length % 2 !== 0) {
          var pg = new _page2.default();
          pages.push(pg);
        }
        var spacerPage = new _page2.default();
        var spacerPage2 = new _page2.default();
        spacerPage.element.style.visibility = 'hidden';
        spacerPage2.element.style.visibility = 'hidden';
        pages.unshift(spacerPage);
        pages.push(spacerPage2);
      }

      for (var i = 0; i < pages.length; i += this.doubleSided ? 2 : 1) {
        if (this.doubleSided) {
          var left = pages[i];
          var right = pages[i + 1];

          var leftPage = left.element;
          var rightPage = right.element;

          var wrap = (0, _hyperscript2.default)('.bindery-spread-wrapper', {
            style: _page2.default.spreadSizeStyle()
          }, leftPage, rightPage);

          this.export.appendChild(wrap);
        } else {
          var _pg2 = pages[i].element;
          _pg2.setAttribute('bindery-side', 'right');
          var _wrap2 = (0, _hyperscript2.default)('.bindery-print-page', (0, _hyperscript2.default)('.bindery-spread-wrapper', {
            style: _page2.default.sizeStyle()
          }, _pg2));
          this.export.appendChild(_wrap2);
        }
      }
    }
  }, {
    key: 'renderInteractive',
    value: function renderInteractive() {
      var _this2 = this;

      this.mode = 'interactive';
      this.export.style.display = 'block';
      this.export.innerHTML = '';
      this.flaps = [];
      this.export.classList.remove('bindery-show-bleed');

      var pages = this.pages.slice();

      if (this.doubleSided) {
        if (this.pages.length % 2 !== 0) {
          var pg = new _page2.default();
          pages.push(pg);
        }
      }
      var spacerPage = new _page2.default();
      var spacerPage2 = new _page2.default();
      spacerPage.element.style.visibility = 'hidden';
      spacerPage2.element.style.visibility = 'hidden';
      pages.unshift(spacerPage);
      pages.push(spacerPage2);

      var leafIndex = 0;

      var _loop = function _loop(i) {
        leafIndex += 1;
        var li = leafIndex;
        var flap = (0, _hyperscript2.default)('div.bindery-page3d', {
          style: _page2.default.sizeStyle(),
          onclick: function onclick() {
            var newLeaf = li - 1;
            if (newLeaf === _this2.currentLeaf) newLeaf += 1;
            _this2.setLeaf(newLeaf);
          }
        });
        // this.makeDraggable(flap);
        _this2.export.classList.add('bindery-stage3d');
        _this2.flaps.push(flap);

        var rightPage = pages[i].element;
        var leftPage = void 0;
        rightPage.classList.add('bindery-page3d-front');
        flap.appendChild(rightPage);
        if (_this2.doubleSided) {
          flap.classList.add('bindery-doubleSided');
          leftPage = pages[i + 1].element;
          leftPage.classList.add('bindery-page3d-back');
          flap.appendChild(leftPage);
        } else {
          leftPage = (0, _hyperscript2.default)('.bindery-page.bindery-page3d-back', {
            style: _page2.default.sizeStyle()
          });
          flap.appendChild(leftPage);
        }
        // TODO: Dynamically add/remove pages.
        // Putting 1000s of elements onscreen
        // locks up the browser.
        // if (i > 200) {
        //   rightPage.style.display = 'none';
        //   leftPage.style.display = 'none';
        //   flap.style.background = '#ddd';
        // }


        var leftOffset = 4;
        if (pages.length * leftOffset > 300) leftOffset = 300 / pages.length;

        flap.style.left = i * leftOffset + 'px';

        _this2.export.appendChild(flap);
      };

      for (var i = 1; i < pages.length - 1; i += this.doubleSided ? 2 : 1) {
        _loop(i);
      }
      if (this.currentLeaf) {
        this.setLeaf(this.currentLeaf);
      } else {
        this.setLeaf(0);
      }
    }
  }, {
    key: 'setLeaf',
    value: function setLeaf(n) {
      this.currentLeaf = n;
      var zScale = 4;
      if (this.flaps.length * zScale > 200) zScale = 200 / this.flaps.length;

      this.flaps.forEach(function (flap, i, arr) {
        // + 0.5 so left and right are even
        var z = (arr.length - Math.abs(i - n + 0.5)) * zScale;
        flap.style.transform = 'translate3d(' + (i < n ? 4 : 0) + 'px,0,' + z + 'px) rotateY(' + (i < n ? -180 : 0) + 'deg)';
      });
    }
    // makeDraggable(flap) {
    //   let isDragging = false;
    //   let pct = 0;
    //   flap.addEventListener('mousedown', () => {
    //     isDragging = true;
    //     flap.style.transition = 'none';
    //   });
    //   document.body.addEventListener('mousemove', (e) => {
    //     if (isDragging) {
    //       e.preventDefault();
    //       const pt = coords(e);
    //       pct = progress01(pt.x, 1000, 200);
    //       const ang = transition(pct, 0, -180);
    //       const z = this.flaps.length;
    //       flap.style.transform = `translate3d(${0}px,0,${z * 5}px) rotateY(${ang}deg)`;
    //     }
    //   });
    //   document.body.addEventListener('mouseup', (e) => {
    //     if (isDragging) {
    //       isDragging = false;
    //       flap.style.transition = '';
    //       if (pct > 0.5) this.setLeaf(this.currentLeaf);
    //       else this.setLeaf(this.currentLeaf + 1);
    //     }
    //   });
    // }

  }]);

  return Viewer;
}();

// const transition = (pct, a, b) => a + (pct * (b - a));
// const clamp = (val, min, max) => {
//   return (((val <= min) ? min : val) >= max) ? max : val;
// };
// const progress = (val, a, b) => (val - a) / (b - a);
// const progress01 = (val, a, b) => clamp(progress(val, a, b), 0, 1);
// const coords = (e) => ((e = e.touches && e.touches[0] || e), ({ x: e.pageX, y: e.pageY }));


exports.default = Viewer;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (title, text) {
  return (0, _hyperscript2.default)('.bindery-error', (0, _hyperscript2.default)('.bindery-error-title', title), (0, _hyperscript2.default)('.bindery-error-text', text), (0, _hyperscript2.default)('.bindery-error-footer', 'Bindery.js v0.1 Alpha'));
};

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(19);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(3)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./viewer.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./viewer.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "@media screen {\n  .bindery-viewing {\n    background: #f1f1f1 !important;\n  }\n  .bindery-export {\n    transition: opacity 0.2s;\n    opacity: 1;\n    background: #f1f1f1;\n    padding: 50px 20px;\n    z-index: 99;\n    position: relative;\n    padding-right: 240px;\n    animation: fadeUp 0.3s;\n    min-height: 100vh;\n  }\n\n   .bindery-measure-area {\n     position: fixed;\n     top: 0;\n     left: 0;\n     background: #f1f1f1;\n     padding: 50px 20px;\n     padding-right: 240px;\n     z-index: 99;\n   }\n\n   .bindery-print-page {\n     margin: 0 auto;\n   }\n\n   .bindery-error {\n     font-family: -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n     font-size: 16px;\n     margin: 15vh 15vw;\n     max-width: 500px;\n     background: url(" + __webpack_require__(20) + ") no-repeat 0% 0%;\n     background-size: 48px;\n     padding-top: 64px;\n   }\n\n   .bindery-error-title {\n     font-size: 1.5em;\n     margin-bottom: 16px;\n   }\n\n   .bindery-error-text {\n     margin-bottom: 16px;\n     white-space: pre-line;\n   }\n\n   .bindery-error-footer {\n     opacity: 0.5;\n     font-size: 0.66rem;\n     text-transform: uppercase;\n     letter-spacing: 0.02em;\n   }\n\n   .bindery-show-bleed .bindery-print-page {\n     background: white;\n     outline: 1px solid rgba(0,0,0,0.1);\n     box-shadow: 0px 1px 3px rgba(0,0,0,0.2);\n     width: 11in;\n     height: 8.5in;\n     margin: 20px auto;\n   }\n\n   .bindery-spread-wrapper:before {\n     display: none;\n   }\n   .bindery-show-bleed .bindery-spread-wrapper:before {\n     display: block;\n   }\n}\n\n@keyframes fadeUp {\n  0% {\n    opacity: 0;\n    /*transform: translate3d(0, 50px, 0);*/\n  }\n  100% {\n    opacity: 1;\n    /*transform: translate3d(0, 0, 0);*/\n  }\n}\n\n@page {\n  size: portrait; /* landscape and portrait keywords work here */\n  margin: 0;\n}\n\n@media print {\n  /* Don't print anything that hasn't been exported. This hides extra controls/ */\n  .bindery-viewing > :not(.bindery-export) {\n    display: none !important;\n  }\n\n  .bindery-print-page {\n    margin: 20px;\n  }\n\n  .bindery-spread-wrapper:before {\n    display: block;\n  }\n\n}\n\n/* Don't print anything that hasn't been exported. This hides extra controls/ */\n.bindery-viewing > :not(.bindery-export) {\n  display: none !important;\n}\n\n.bindery-print-page {\n  page-break-after: always;\n  position: relative;\n  overflow: hidden;\n}\n\n\n.bindery-spread-wrapper {\n  position: relative;\n  display: flex;\n  width: 800px;\n  margin: 50px auto;\n}\n\n/* Crop Marks */\n.bindery-spread-wrapper:before {\n\tcontent: \"\";\n  pointer-events: none;\n\tposition: absolute;\n\ttop: -30px;\n\tleft: -30px;\n  border-width: 30px;\n\twidth: 100%;\n\theight: 100%;\n  -webkit-border-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowMjAwMjQwRUNDRDMxMUUzOEYzQ0EwRDQ2MzU4OTNGQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowMjAwMjQwRkNDRDMxMUUzOEYzQ0EwRDQ2MzU4OTNGQyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkJFRjE1REVCQ0NEMDExRTM4RjNDQTBENDYzNTg5M0ZDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkJFRjE1REVDQ0NEMDExRTM4RjNDQTBENDYzNTg5M0ZDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+OTmWYwAAA3VJREFUeNrs2MGKgzAUhtH+pXt9/6esT3An3RWEQWidScw5EFpchZvwgaaqbswnyevn/fDT610Yaa+c624EgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFoBgAQgWIFgA/+ZhBFNb7ZWRpKpMYcaDT3bPer0LI+0Vr4QAggUIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFgAAv0tbZQyHrW1txsAXLW09jcErISBYAAAAXEOqfHOf8uCT3bNe78JIe+VcvmEBggUgWIBgAQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFiBYRgAIFoBgAYIFIFgAggUIFgAAH0lbZQyHrW1txsAXLW09jcErISBYAAAAXEOqfHOf8uCT3bNe78JIe+VcvmEBggUgWIBgAQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFiBYRgAIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABggUgWACCBQgWwN97GMHUlrf/m73Su1SVKcx48Mnrp0a4CyPtFa+EAIIFCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABggUgWACCBQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABV/UjwADn4TtZkBC9rAAAAABJRU5ErkJggg==) 140 fill stretch round;\n\tborder-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowMjAwMjQwRUNDRDMxMUUzOEYzQ0EwRDQ2MzU4OTNGQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowMjAwMjQwRkNDRDMxMUUzOEYzQ0EwRDQ2MzU4OTNGQyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkJFRjE1REVCQ0NEMDExRTM4RjNDQTBENDYzNTg5M0ZDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkJFRjE1REVDQ0NEMDExRTM4RjNDQTBENDYzNTg5M0ZDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+OTmWYwAAA3VJREFUeNrs2MGKgzAUhtH+pXt9/6esT3An3RWEQWidScw5EFpchZvwgaaqbswnyevn/fDT610Yaa+c624EgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFoBgAQgWIFgA/+ZhBFNb7ZWRpKpMYcaDT3bPer0LI+0Vr4QAggUIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFgAAv0tbZQyHrW1txsAXLW09jcErISBYAAAAXEOqfHOf8uCT3bNe78JIe+VcvmEBggUgWIBgAQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFiBYRgAIFoBgAYIFIFgAggUIFgAAH0lbZQyHrW1txsAXLW09jcErISBYAAAAXEOqfHOf8uCT3bNe78JIe+VcvmEBggUgWIBgAQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFiBYRgAIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABggUgWACCBQgWwN97GMHUlrf/m73Su1SVKcx48Mnrp0a4CyPtFa+EAIIFCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABggUgWACCBQgWgGABggUgWACCBQgWgGABCBYgWACCBSBYgGABCBaAYAGCBSBYAIIFCBaAYAEIFiBYAIIFIFiAYAEIFoBgAYIFIFgAggUIFoBgAYIFIFgAggUIFoBgAQgWIFgAggUgWIBgAQgWgGABV/UjwADn4TtZkBC9rAAAAABJRU5ErkJggg==) 140 fill stretch round;\n\tborder-image-slice: 133;\n\tborder-image-repeat: stretch round;\n\tbox-sizing: content-box;\n  border-style: solid;\n  z-index: 999;\n}\n\n\n.bindery-stage3d {\n  perspective: 3000px;\n  min-height: 100vh;\n  transform-style: preserve-3d;\n}\n\n.bindery-page3d {\n  margin: auto;\n  width: 400px;\n  height: 600px;\n  transform: rotateY(0);\n  transition: transform 0.5s, box-shadow 0.1s;\n  transform-style: preserve-3d;\n  transform-origin: left;\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n}\n\n.bindery-page3d:hover {\n  box-shadow: 2px 0 4px rgba(0,0,0,0.2);\n}\n.bindery-page3d.flipped {\n  transform: rotateY(-180deg);\n}\n\n.bindery-page3d .bindery-page {\n  position: absolute;\n  backface-visibility: hidden;\n}\n\n.bindery-page3d .bindery-page3d-front {\n  transform: rotateY(0);\n}\n.bindery-page3d .bindery-page3d-back {\n  transform: rotateY(-180deg);\n}\n\n.bindery-page3d .bindery-page3d-front::after {\n  box-shadow: inset 12px 0 12px -12px rgba(0,0,0,0.4)\n}\n.bindery-page3d .bindery-page3d-back::after {\n  box-shadow: inset -12px 0 12px -12px rgba(0,0,0,0.4)\n}\n", ""]);

// exports


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8'?%3E %3Csvg width='36px' height='36px' viewBox='0 0 36 36' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E %3C!-- Generator: Sketch 45.2 (43514) - http://www.bohemiancoding.com/sketch --%3E %3Ctitle%3Einteractive copy 4%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E %3Crect id='path-1' x='0' y='4' width='15' height='23'%3E%3C/rect%3E %3Crect id='path-2' x='15' y='4' width='15' height='23'%3E%3C/rect%3E %3Cpolygon id='path-3' points='14 4.07147535 27 0 27 22.9285247 14 27'%3E%3C/polygon%3E %3C/defs%3E %3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='interactive-copy-4'%3E %3Cg id='Group-2-Copy-3' transform='translate(3.000000, 2.000000)'%3E %3Cg id='Rectangle-2-Copy-6'%3E %3Cuse fill='%23FFFFFF' fill-rule='evenodd' xlink:href='%23path-1'%3E%3C/use%3E %3Crect stroke='%23000000' stroke-width='1' x='0.5' y='4.5' width='14' height='22'%3E%3C/rect%3E %3C/g%3E %3Cg id='Rectangle-2-Copy-7'%3E %3Cuse fill='%23FFFFFF' fill-rule='evenodd' xlink:href='%23path-2'%3E%3C/use%3E %3Crect stroke='%23000000' stroke-width='1' x='15.5' y='4.5' width='14' height='22'%3E%3C/rect%3E %3C/g%3E %3Cg id='Rectangle-2-Copy-6'%3E %3Cuse fill='%23FFFFFF' fill-rule='evenodd' xlink:href='%23path-3'%3E%3C/use%3E %3Cpath stroke='%23000000' stroke-width='1' d='M14.5,4.43882867 L14.5,26.3194563 L26.5,22.5611713 L26.5,0.680543732 L14.5,4.43882867 Z'%3E%3C/path%3E %3C/g%3E %3Cpolygon id='Path-2' fill='%23000000' opacity='0.3' points='16.3241613 26.7071852 25.7154453 22.615177 26.1596848 4.74924377 28 4.30920273 28 27'%3E%3C/polygon%3E %3C/g%3E %3Ccircle id='Oval' fill='%23000000' cx='11' cy='14' r='1'%3E%3C/circle%3E %3Ccircle id='Oval' fill='%23000000' cx='11' cy='21' r='1'%3E%3C/circle%3E %3Cpath d='M28.1793786,11.0743011 C24.667534,11.0743011 21.8206214,13.9212136 21.8206214,17.4330583' id='Oval-2' stroke='%23000000' transform='translate(25.000000, 14.253680) rotate(-45.000000) translate(-25.000000, -14.253680) '%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/svg%3E\""

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _convertUnits = __webpack_require__(22);

var _convertUnits2 = _interopRequireDefault(_convertUnits);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(23);

var select = function select() {
  for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
    arg[_key] = arguments[_key];
  }

  return _hyperscript2.default.apply(undefined, ['select'].concat(arg));
};
var option = function option() {
  for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    arg[_key2] = arguments[_key2];
  }

  return _hyperscript2.default.apply(undefined, ['option'].concat(arg));
};
var inputNumber = function inputNumber(val) {
  return (0, _hyperscript2.default)('input', { type: 'number', value: val });
};
var btn = function btn() {
  for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    arg[_key3] = arguments[_key3];
  }

  return _hyperscript2.default.apply(undefined, ['button.bindery-btn'].concat(arg));
};
var btnMini = function btnMini() {
  for (var _len4 = arguments.length, arg = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    arg[_key4] = arguments[_key4];
  }

  return _hyperscript2.default.apply(undefined, ['button.bindery-btn.bindery-btn-mini'].concat(arg));
};
var btnMain = function btnMain() {
  for (var _len5 = arguments.length, arg = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    arg[_key5] = arguments[_key5];
  }

  return _hyperscript2.default.apply(undefined, ['button.bindery-btn.bindery-btn-main'].concat(arg));
};
var toggleSwitch = function toggleSwitch() {
  return (0, _hyperscript2.default)('.bindery-switch', (0, _hyperscript2.default)('.bindery-switch-handle'));
};
var switchRow = function switchRow() {
  for (var _len6 = arguments.length, arg = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    arg[_key6] = arguments[_key6];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-toggle'].concat(arg, [toggleSwitch]));
};
var row = function row() {
  for (var _len7 = arguments.length, arg = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    arg[_key7] = arguments[_key7];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-toggle'].concat(arg));
};
var label = function label() {
  for (var _len8 = arguments.length, arg = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    arg[_key8] = arguments[_key8];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-label'].concat(arg));
};

var Controls = function Controls(opts) {
  var _this = this;

  _classCallCheck(this, Controls);

  this.holder = (0, _hyperscript2.default)('div.bindery-controls');
  document.body.appendChild(this.holder);

  this.binder = opts.binder;

  var done = function done() {
    _this.binder.cancel();
  };
  var print = function print() {
    _this.binder.viewer.setPrint();
    window.print();
  };

  var printBtn = btnMain({ onclick: print }, 'Print');

  var layoutControl = void 0;
  var guidesToggle = void 0;
  var facingToggle = void 0;

  var toggleGuides = function toggleGuides() {
    guidesToggle.classList.toggle('selected');
    _this.binder.viewer.toggleGuides();
  };
  guidesToggle = switchRow({ onclick: toggleGuides }, 'Show Bounds');

  var toggleFacing = function toggleFacing() {
    facingToggle.classList.toggle('selected');
    layoutControl.classList.toggle('not-facing');
    _this.binder.viewer.toggleDouble();
  };
  facingToggle = switchRow({ onclick: toggleFacing }, 'Facing Pages');
  facingToggle.classList.add('selected');

  var doneBtn = '';
  if (!this.binder.runImmeditately) {
    doneBtn = btn({ onclick: done }, 'Done');
  }

  var input = {
    top: inputNumber(this.binder.pageMargin.top),
    inner: inputNumber(this.binder.pageMargin.inner),
    outer: inputNumber(this.binder.pageMargin.outer),
    bottom: inputNumber(this.binder.pageMargin.bottom),
    width: inputNumber(this.binder.pageSize.width),
    height: inputNumber(this.binder.pageSize.height)
  };

  var sizeControl = (0, _hyperscript2.default)('.bindery-val.bindery-size', (0, _hyperscript2.default)('div', 'W', input.width), (0, _hyperscript2.default)('div', 'H', input.height));

  var changeUnit = function changeUnit(newUnit) {
    var oldUnit = _this.binder.pageUnit;
    Object.values(input).forEach(function (inputEl) {
      var el = inputEl;
      var newVal = (0, _convertUnits2.default)(parseFloat(el.value), oldUnit, newUnit);
      var rounded = Math.round(newVal * 100) / 100;
      el.value = rounded;
    });
    _this.binder.pageUnit = newUnit;
  };

  var unitSelect = select({
    onchange: function onchange() {
      changeUnit(this.value);
    }
  }, option({ value: 'px' }, 'Pixels'), option({ disabled: true }, '96px = 1 in'), option({ disabled: true }, ''), option({ value: 'pt' }, 'Points'), option({ disabled: true }, '72pt = 1 in'), option({ disabled: true }, ''), option({ value: 'pc' }, 'Pica'), option({ disabled: true }, '6pc = 72pt = 1in'), option({ disabled: true }, ''), option({ value: 'in' }, 'Inches'), option({ disabled: true }, '1in = 96px'), option({ disabled: true }, ''), option({ value: 'cm' }, 'cm'), option({ disabled: true }, '2.54cm = 1in'), option({ disabled: true }, ''), option({ value: 'mm' }, 'mm'), option({ disabled: true }, '25.4mm = 1in'));

  unitSelect.value = this.binder.pageUnit;
  var unitSwitch = row('Units', unitSelect);

  var marginPreview = (0, _hyperscript2.default)('.preview');
  var marginControl = (0, _hyperscript2.default)('.bindery-val.bindery-margin', (0, _hyperscript2.default)('.top', input.top), (0, _hyperscript2.default)('.inner', input.inner), (0, _hyperscript2.default)('.outer', input.outer), (0, _hyperscript2.default)('.bottom', input.bottom), marginPreview);

  layoutControl = (0, _hyperscript2.default)('.bindery-layout-control', sizeControl, marginControl);

  var paperSize = row('Paper Size', select(option('Letter'), option({ disabled: true }, '8.5 x 11'), option({ disabled: true }, ''), option('Legal'), option({ disabled: true }, '8.5 x 14'), option({ disabled: true }, ''), option('Tabloid'), option({ disabled: true }, '11 x 17'), option({ disabled: true }, ''), option('A4'), option({ disabled: true }, 'mm x mm')));

  var perSheet = row('Pages per Sheet', select(option('1'), option('2')));

  var orientation = row('Orientation', select(option('Landscape'), option('Portrait')));

  var validCheck = (0, _hyperscript2.default)('div', { style: {
      display: 'none',
      color: '#e2b200'
    } }, 'Too Small');
  var inProgress = (0, _hyperscript2.default)('div', { style: {
      display: 'none'
    } }, 'Updating...');
  var forceRefresh = btnMini({ onclick: function onclick() {
      inProgress.style.display = 'block';
      forceRefresh.style.display = 'none';
      setTimeout(function () {
        _this.binder.makeBook(function () {
          inProgress.style.display = 'none';
          forceRefresh.style.display = 'block';
        }, 100);
      });
    } }, 'Update');

  var gridMode = void 0;
  var printMode = void 0;
  var interactMode = void 0;
  var setGrid = function setGrid() {
    gridMode.classList.add('selected');
    interactMode.classList.remove('selected');
    printMode.classList.remove('selected');

    _this.binder.viewer.setGrid();
  };
  var setInteractive = function setInteractive() {
    gridMode.classList.remove('selected');
    interactMode.classList.add('selected');
    printMode.classList.remove('selected');

    _this.binder.viewer.setInteractive();
  };
  var setPrint = function setPrint() {
    gridMode.classList.remove('selected');
    interactMode.classList.remove('selected');
    printMode.classList.add('selected');

    _this.binder.viewer.setPrint();
  };
  gridMode = (0, _hyperscript2.default)('.bindery-viewmode.grid', { onclick: setGrid }, (0, _hyperscript2.default)('.icon'), 'Grid');
  interactMode = (0, _hyperscript2.default)('.bindery-viewmode.interactive', { onclick: setInteractive }, (0, _hyperscript2.default)('.icon'), 'Interactive');
  printMode = (0, _hyperscript2.default)('.bindery-viewmode.print', { onclick: setPrint }, (0, _hyperscript2.default)('.icon'), 'Sheet');
  if (this.binder.viewer.mode === 'grid') gridMode.classList.add('selected');
  if (this.binder.viewer.mode === 'interactive') interactMode.classList.add('selected');
  if (this.binder.viewer.mode === 'print') printMode.classList.add('selected');
  var viewSwitcher = (0, _hyperscript2.default)('.bindery-viewswitcher', gridMode, printMode, interactMode);

  var header = (0, _hyperscript2.default)('div', { style: {
      padding: '20px',
      'font-size': '20px'
    } }, 'Bindery');

  var updateLayoutPreview = function updateLayoutPreview(newSize, newMargin) {
    var BASE = 80;
    var ratio = newSize.width / newSize.height;
    ratio = Math.max(ratio, 0.6);
    ratio = Math.min(ratio, 1.8);

    var width = void 0;
    var height = void 0;
    if (ratio > 2) {
      width = BASE * ratio;
      height = BASE;
    } else {
      width = BASE;
      height = BASE * 1 / ratio;
    }
    var t = newMargin.top / newSize.height * height;
    var b = newMargin.bottom / newSize.height * height;
    var o = newMargin.outer / newSize.width * width;
    var i = newMargin.inner / newSize.width * width;

    sizeControl.style.width = width + 'px';
    sizeControl.style.height = height + 'px';
    marginControl.style.width = width + 'px';
    marginControl.style.height = height + 'px';

    marginPreview.style.top = t + 'px';
    marginPreview.style.bottom = b + 'px';
    marginPreview.style.left = i + 'px';
    marginPreview.style.right = o + 'px';
  };
  updateLayoutPreview(this.binder.pageSize, this.binder.pageMargin);

  this.setInProgress = function () {
    header.innerText = 'Paginating...';
    validCheck.style.display = 'none';
    inProgress.style.display = 'block';
    forceRefresh.style.display = 'none';
  };

  this.updateProgress = function (count) {
    header.innerText = count + ' Pages';
  };

  this.setDone = function () {
    header.innerText = _this.binder.viewer.pages.length + ' Pages';
    inProgress.style.display = 'none';
    forceRefresh.style.display = 'block';
    validCheck.style.display = 'none';
  };

  this.setInvalid = function () {
    validCheck.style.display = 'block';
    forceRefresh.style.display = 'none';
    inProgress.style.display = 'none';
  };

  var updateLayout = function updateLayout() {
    var newMargin = {
      top: input.top.value,
      inner: input.inner.value,
      outer: input.outer.value,
      bottom: input.bottom.value
    };
    var newSize = {
      height: input.height.value,
      width: input.width.value
    };

    var needsUpdate = false;
    Object.keys(newMargin).forEach(function (k) {
      if (_this.binder.pageMargin[k] !== newMargin[k]) {
        needsUpdate = true;
      }
    });
    Object.keys(newSize).forEach(function (k) {
      if (_this.binder.pageSize[k] !== newSize[k]) {
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      updateLayoutPreview(newSize, newMargin);
      _this.binder.setSize(newSize);
      _this.binder.setMargin(newMargin);

      if (_this.binder.isSizeValid()) {
        _this.binder.makeBook();
      } else {
        _this.setInvalid();
      }
    }
  };

  var updateDelay = void 0;
  var throttledUpdate = function throttledUpdate() {
    clearTimeout(updateDelay);
    updateDelay = setTimeout(updateLayout, 700);
  };

  Object.keys(input).forEach(function (k) {
    input[k].addEventListener('change', throttledUpdate);
    input[k].addEventListener('keyup', throttledUpdate);
  });

  var layoutState = (0, _hyperscript2.default)('div', { style: { float: 'right' } }, forceRefresh, validCheck, inProgress);

  this.holder.appendChild((0, _hyperscript2.default)('div', {}, header, doneBtn, printBtn, label(layoutState, 'Pagination'), layoutControl, unitSwitch, facingToggle, label('Print'), paperSize, perSheet, orientation, label('View'), guidesToggle, viewSwitcher));
};

exports.default = Controls;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Convert units, via pixels, while making assumptions

// Inch assumptions
var inchPixels = 96;
// const inchPoints = 72;
var inchMM = 25.4;

// Number of pixels in one [unit]
var pxInOne = {
  px: 1,
  in: inchPixels,
  pt: 4 / 3,
  pc: 4 / 3 * 12,
  mm: inchMM / inchPixels,
  cm: inchMM / inchPixels * 10
};

var unitToPx = function unitToPx(unitVal, unit) {
  return unitVal * pxInOne[unit];
};
var pxToUnit = function pxToUnit(pixelVal, unit) {
  return pixelVal / pxInOne[unit];
};
var convert = function convert(val, from, to) {
  return pxToUnit(unitToPx(val, from), to);
};

module.exports = convert;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(24);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(3)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./controls.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./controls.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "@media screen {\n  .bindery-viewing .bindery-controls {\n    display: block !important;\n  }\n}\n\n.bindery-controls {\n  font-family: -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  right: 0;\n  width: 240px;\n  z-index: 999;\n  margin: auto;\n  background: white;\n  outline: 1px solid rgba(0,0,0,0.05);\n  animation: fadeIn 0.3s;\n  overflow: scroll;\n  padding-bottom: 100px;\n}\n\n.bindery-inProgress .bindery-controls {\n  pointer-events: none;\n}\n\n@keyframes fadeIn {\n  0% {\n    opacity: 0;\n    transform: translate3d(20px, 0, 0);\n  }\n  20% {\n    opacity: 0;\n    transform: translate3d(20px, 0, 0);\n  }\n  100% {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.bindery-status {\n  color: white;\n  padding: 6px 10px;\n}\n\n.bindery-btn {\n  -webkit-appearance: none;\n  padding: 8px 12px;\n  color: #444;\n  border: none;\n  background: rgba(0,0,0,0.06);\n  cursor: pointer;\n  font-size: 12px;\n  text-transform: uppercase;\n  letter-spacing: 0.01em;\n  font-weight: 500;\n  display: inline-block;\n  border-radius: 2px;\n  margin: 0 0 16px 16px;\n  width: auto;\n}\n\n.bindery-btn-main {\n  background: navy;\n  color: white;\n  /*border-color: black;*/\n}\n\n.bindery-btn:focus {\n  /*outline: 1px solid blue;*/\n  outline: none;\n}\n.bindery-btn:hover {\n  background: rgba(0,0,0,0.1);\n}\n.bindery-btn:active {\n  background: rgba(0,0,0,0.14);\n}\n.bindery-btn-main:hover {\n  background: navy;\n  opacity: 0.7;\n}\n.bindery-btn-main:active {\n  background: black;\n  opacity: 1;\n}\n.bindery-btn-mini {\n  color: #aaa;\n  background: transparent;\n  padding: 6px 8px;\n  margin: -6px -8px;\n  font: inherit;\n}\n.bindery-btn-mini:hover {\n  color: #aaa;\n  background: rgba(0,0,0,0.06);\n}\n\n.bindery-inProgress .bindery-btn {\n  opacity: 0.2;\n  pointer-events: none;\n}\n\n.bindery-label {\n  font-size: 11px;\n  text-transform: uppercase;\n  color: #aaa;\n  letter-spacing: 0.04em;\n  padding: 16px 20px;\n  border-top: 1px solid #ddd;\n}\n\n.bindery-viewswitcher {\n  padding: 12px 8px;\n  position: fixed;\n  bottom: 0;\n  right: 0;\n  background: white;\n  z-index: 99;\n  width: 240px;\n}\n.bindery-viewmode {\n  background-position: top center;\n  background-repeat: no-repeat;\n  height: 64px;\n  width: 33%;\n  display: inline-block;\n  text-align: center;\n  font-size: 12px;\n  color: #aaa;\n  cursor: pointer;\n}\n.bindery-viewmode .icon {\n  height: 36px;\n  width: 36px;\n  background: currentColor;\n  margin: 0 auto 8px;\n}\n.bindery-viewmode:hover {\n  color: black;\n}\n.bindery-viewmode.selected {\n  color: navy;\n}\n\n.bindery-viewmode.grid .icon {\n  -webkit-mask: url(" + __webpack_require__(25) + ") no-repeat 50% 50%;\n}\n.bindery-viewmode.interactive .icon {\n  -webkit-mask: url(" + __webpack_require__(26) + ") no-repeat 50% 50%;\n}\n.bindery-viewmode.print .icon {\n  -webkit-mask: url(" + __webpack_require__(27) + ") no-repeat 50% 50%;\n}\n\n.bindery-toggle, .bindery-val {\n  position: relative;\n  display: block;\n  font-size: 14px;\n  padding: 8px 20px;\n  cursor: pointer;\n  margin-bottom: 8px;\n}\n\n.bindery-toggle select {\n  float: right;\n  border: none;\n  background: transparent;\n  padding: 12px;\n}\n\n.bindery-toggle select:hover {\n  background: rgba(0,0,0,0.04);\n}\n\n.bindery-infopanel {\n  font-size: 14px;\n  margin-bottom: 8px;\n}\n\n.bindery-infopanel div {\n  padding: 8px 20px;\n}\n\n\n.bindery-val input {\n  width: 85px;\n  padding: 4px 0 4px 8px;\n  text-align: right;\n  border: none;\n  background: none;\n  position: absolute;\n  top: 0;\n  right: 0;\n  height: 100%;\n  width: 100%;\n}\n\n.bindery-size div {\n  position: relative;\n  padding: 6px 0 6px 14px;\n  color: #aaa;\n}\n\n.bindery-size::before, .bindery-size::after {\n  content: \"\";\n  display: block;\n  position: absolute;\n  background: #a9a9ff;\n}\n.bindery-size::before {\n  top: 0;\n  left: 6px;\n  bottom: 0;\n  width: 1px;\n}\n.bindery-size::after {\n  top: 6px;\n  left: 0;\n  right: 0;\n  height: 1px;\n}\n\n.bindery-size input {\n}\n\n.bindery-size, .bindery-margin {\n  display: inline-block;\n  vertical-align: middle;\n  margin: 0;\n  min-height: 80px;\n  background: white;\n  outline: 1px solid #ddd;\n  height: 100px;\n  width: 100px;\n}\n\n.bindery-size {\n  padding: 8px 0;\n  font-size: 12px;\n}\n\n.not-facing .bindery-size {\n  margin-right: 20px;\n  box-shadow: none;\n}\n.not-facing .bindery-margin {\n  box-shadow: none;\n}\n\n.bindery-layout-control {\n    margin: 4px 20px 16px;\n}\n\n\n.bindery-margin {\n  overflow: hidden;\n}\n.bindery-margin .preview {\n  position: absolute;\n  top: 20px;\n  left: 20px;\n  right: 20px;\n  bottom: 20px;\n  border: 1px solid #a9a9ff;\n  height: auto;\n  width: auto;\n  z-index: 0;\n  pointer-events: none;\n  transition: border 0.2s;\n}\n\n.top:hover ~ .preview {\n  border-color: #eee;\n  border-top-color: #a9a9ff;\n}\n.bottom:hover ~ .preview {\n  border-color: #eee;\n  border-bottom-color: #a9a9ff;\n}\n.inner:hover ~ .preview {\n  border-color: #eee;\n  border-left-color: #a9a9ff;\n}\n.outer:hover ~ .preview {\n  border-color: #eee;\n  border-right-color: #a9a9ff;\n}\n\n.bindery-margin input {\n  text-align: center;\n  padding: 0;\n  margin-right: -5px;\n  font-size: 12px;\n}\n.bindery-margin input:focus {\n  /*text-decoration: underline;*/\n  /*background: none !important;*/\n}\n\n.bindery-margin > div  {\n  position: absolute;\n  width: 54px;\n  height: 24px;\n  z-index: 5;\n  background: white;\n}\n.bindery-margin > div:hover {\n  z-index: 99;\n}\n\n.bindery-margin .top {\n  left: 0;\n  right: 0;\n  margin: auto;\n  top: 0;\n}\n.bindery-margin .bottom {\n  left: 0;\n  right: 0;\n  margin: auto;\n  bottom: 0;\n}\n.bindery-margin .inner {\n  left: -2px;\n  text-align: left;\n  top: calc(50% - 12px);\n}\n.bindery-margin .inner input {\n  text-align: left;\n}\n\n.bindery-margin .outer {\n  right: -2px;\n  text-align: right;\n  top: calc(50% - 12px);\n}\n.bindery-margin .outer input {\n  text-align: right;\n}\n\n\n.bindery-val input:focus {\n    outline: none;\n    background: rgba(0,0,0,0.04);\n}\n\n.bindery-switch {\n  width: 28px;\n  height: 16px;\n  background: rgba(0,0,0,0.2);\n  border-radius: 8px;\n  margin-right: 5px;\n  vertical-align: middle;\n  float: right;\n  font-size: 8px;\n  transition: all 0.2s;\n  position: relative;\n}\n.bindery-switch-handle {\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background: white;\n  box-shadow: 0 1px 2px rgba(0,0,0,0.2);\n  transition: all 0.2s;\n  position: absolute;\n  left: 0px;\n  top: 0px;\n}\n.bindery-toggle:hover .bindery-switch-handle {\n  box-shadow: 0 2px 3px rgba(0,0,0,0.3);\n}\n\n.bindery-toggle.selected .bindery-switch {\n  background: rgba(0, 0, 128, 0.42);\n}\n.bindery-toggle.selected .bindery-switch-handle {\n  background: navy;\n  left: 12px;\n}\n", ""]);

// exports


/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8'?%3E %3Csvg width='36px' height='36px' viewBox='0 0 36 36' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E %3C!-- Generator: Sketch 45.2 (43514) - http://www.bohemiancoding.com/sketch --%3E %3Ctitle%3Eicon-grid%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='icon-grid' stroke='%23000000'%3E %3Cg id='Group-4-Copy' transform='translate(6.000000, 1.000000)'%3E %3Crect id='Rectangle-2-Copy-4' x='0.5' y='18.5' width='10' height='15'%3E%3C/rect%3E %3Crect id='Rectangle-2-Copy-13' x='10.5' y='18.5' width='10' height='15'%3E%3C/rect%3E %3Crect id='Rectangle-2-Copy-13' x='10.5' y='0.5' width='10' height='15'%3E%3C/rect%3E %3Crect id='Rectangle-2-Copy-14' x='0.5' y='0.5' width='10' height='15'%3E%3C/rect%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E\""

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8'?%3E %3Csvg width='36px' height='36px' viewBox='0 0 36 36' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E %3C!-- Generator: Sketch 45.2 (43514) - http://www.bohemiancoding.com/sketch --%3E %3Ctitle%3Eicon-interactive%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='icon-interactive' fill='%23000000'%3E %3Cg id='Group-2-Copy-3' transform='translate(3.000000, 2.000000)' fill-rule='nonzero'%3E %3Cpath d='M1,5 L1,26 L14,26 L14,5 L1,5 Z M0,4 L15,4 L15,27 L0,27 L0,4 Z' id='Rectangle-2-Copy-6'%3E%3C/path%3E %3Cpath d='M29,5 L28,4 L28,5 L29,5 Z M28,26 L29,26 L28,27 L28,26 Z M25.4092533,5 L25.4092533,4 L29,4 L29,27 L14,27 L14.4960545,26 L28,26 L28,5 L25.4092533,5 Z M29,26 L28,27 L28,26 L29,26 Z M28,4 L29,5 L28,5 L28,4 Z M28,5 L25.4092533,5 L25.4092533,4 L29,4 L29,27 L14,27 L14.4960545,26 L28,26 L28,5 Z' id='Rectangle-2-Copy-7'%3E%3C/path%3E %3Cpath d='M15,4.78817695 L15,25.6047192 L25,22.2118231 L25,1.39528082 L15,4.78817695 Z M14,4.07147535 L26,0 L26,22.9285247 L14,27 L14,4.07147535 Z' id='Rectangle-2-Copy-6'%3E%3C/path%3E %3C/g%3E %3Cpolygon id='Path-2' opacity='0.3' points='18.3241613 28.7071852 27.7154453 24.615177 28.1596848 6.74924377 30 6.30920273 30 29'%3E%3C/polygon%3E %3C/g%3E %3C/g%3E %3C/svg%3E\""

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8'?%3E %3Csvg width='36px' height='36px' viewBox='0 0 36 36' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E %3C!-- Generator: Sketch 45.2 (43514) - http://www.bohemiancoding.com/sketch --%3E %3Ctitle%3Eicon-sheet%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='icon-sheet' stroke='%23000000'%3E %3Crect id='Rectangle-2-Copy' x='1.5' y='4.5' width='32' height='26'%3E%3C/rect%3E %3Cpath d='M17.5,7.5 L17.5,9.5' id='Line-2-Copy' stroke-linecap='square'%3E%3C/path%3E %3Cpath d='M8.5,7.5 L8.5,9.5' id='Line-2-Copy-2' stroke-linecap='square'%3E%3C/path%3E %3Cpath d='M26.5,7.5 L26.5,9.5' id='Line-2-Copy-3' stroke-linecap='square'%3E%3C/path%3E %3Cpath d='M4.5,11.5 L6.5,11.5' id='Line-3' stroke-linecap='square'%3E%3C/path%3E %3Cpath d='M28.5,11.5 L30.5,11.5' id='Line-3-Copy' stroke-linecap='square'%3E%3C/path%3E %3Cpath d='M17.5,24.5 L17.5,26.5' id='Line-2-Copy-4' stroke-linecap='square' transform='translate(17.500000, 25.500000) scale(1, -1) translate(-17.500000, -25.500000) '%3E%3C/path%3E %3Cpath d='M8.5,24.5 L8.5,26.5' id='Line-2-Copy-5' stroke-linecap='square' transform='translate(8.500000, 25.500000) scale(1, -1) translate(-8.500000, -25.500000) '%3E%3C/path%3E %3Cpath d='M26.5,23.5 L26.5,26.5' id='Line-2-Copy-6' stroke-linecap='square' transform='translate(27.000000, 25.000000) scale(1, -1) translate(-27.000000, -25.000000) '%3E%3C/path%3E %3Cpath d='M4.5,22.5 L6.5,22.5' id='Line-3-Copy-2' stroke-linecap='square' transform='translate(5.500000, 22.500000) scale(1, -1) translate(-5.500000, -22.500000) '%3E%3C/path%3E %3Cpath d='M26.5,21.5 L30.5,21.5' id='Line-3-Copy-3' stroke-linecap='square' transform='translate(28.500000, 22.000000) scale(1, -1) translate(-28.500000, -22.000000) '%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/svg%3E\""

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _breakBefore = __webpack_require__(29);

var _breakBefore2 = _interopRequireDefault(_breakBefore);

var _FullPage = __webpack_require__(30);

var _FullPage2 = _interopRequireDefault(_FullPage);

var _Spread = __webpack_require__(31);

var _Spread2 = _interopRequireDefault(_Spread);

var _Footnote = __webpack_require__(34);

var _Footnote2 = _interopRequireDefault(_Footnote);

var _PageReference = __webpack_require__(35);

var _PageReference2 = _interopRequireDefault(_PageReference);

var _PageNumber = __webpack_require__(36);

var _PageNumber2 = _interopRequireDefault(_PageNumber);

var _RunningHeader = __webpack_require__(39);

var _RunningHeader2 = _interopRequireDefault(_RunningHeader);

var _BinderyRule = __webpack_require__(0);

var _BinderyRule2 = _interopRequireDefault(_BinderyRule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Spread: _Spread2.default,
  FullPage: _FullPage2.default,
  Footnote: _Footnote2.default,
  BreakBefore: _breakBefore2.default,
  PageNumber: _PageNumber2.default,
  RunningHeader: _RunningHeader2.default,
  PageReference: _PageReference2.default,
  BinderyRule: _BinderyRule2.default,
  createRule: function createRule(options) {
    return new _BinderyRule2.default(options);
  }
};

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new BreakBefore(userOptions);
};

var _BinderyRule2 = __webpack_require__(0);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BreakBefore = function (_BinderyRule) {
  _inherits(BreakBefore, _BinderyRule);

  function BreakBefore(options) {
    _classCallCheck(this, BreakBefore);

    options.name = 'Break Before';
    return _possibleConstructorReturn(this, (BreakBefore.__proto__ || Object.getPrototypeOf(BreakBefore)).call(this, options));
  }

  _createClass(BreakBefore, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt, state, requestNewPage) {
      if (state.currentPage.flowContent.innerText !== '') {
        var newPage = requestNewPage();
        newPage.setPreference('right');
      }
    }
  }]);

  return BreakBefore;
}(_BinderyRule3.default);

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new FullPage(userOptions);
};

var _BinderyRule2 = __webpack_require__(0);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var prevPage = void 0;
var prevElementPath = void 0;

var FullPage = function (_BinderyRule) {
  _inherits(FullPage, _BinderyRule);

  function FullPage(options) {
    _classCallCheck(this, FullPage);

    options.name = 'Full Page Spread';
    return _possibleConstructorReturn(this, (FullPage.__proto__ || Object.getPrototypeOf(FullPage)).call(this, options));
  }

  _createClass(FullPage, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt, state, requestNewPage) {
      prevPage = state.currentPage;
      prevElementPath = state.path;

      requestNewPage();

      // TODO: Rather than just add padding,
      // put full-bleed content on a separate
      // out-of-flow background layer
      if (elmt.classList.contains('bleed')) {
        state.currentPage.element.classList.add('bleed');
      }
    }
  }, {
    key: 'afterAdd',
    value: function afterAdd(elmt, state) {
      state.currentPage = prevPage;
      state.path = prevElementPath;
    }
  }]);

  return FullPage;
}(_BinderyRule3.default);

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new Spread(userOptions);
};

var _BinderyRule2 = __webpack_require__(0);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

__webpack_require__(32);

var Spread = function (_BinderyRule) {
  _inherits(Spread, _BinderyRule);

  function Spread(options) {
    _classCallCheck(this, Spread);

    options.name = 'Spread';

    var _this = _possibleConstructorReturn(this, (Spread.__proto__ || Object.getPrototypeOf(Spread)).call(this, options));

    _this.prevPage = null;
    _this.prevElementPath = null;
    return _this;
  }

  _createClass(Spread, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt, state, requestNewPage) {
      this.prevPage = state.currentPage;
      this.prevElementPath = state.path;

      requestNewPage();
    }
  }, {
    key: 'afterAdd',
    value: function afterAdd(elmt, state, requestNewPage) {
      var leftPage = state.currentPage;
      var dupedContent = leftPage.flowContent.cloneNode(true);
      var rightPage = requestNewPage();
      rightPage.flowBox.innerHTML = '';
      rightPage.flowBox.appendChild(dupedContent);
      rightPage.flowContent = dupedContent;

      leftPage.element.classList.add('bindery-spread');
      leftPage.element.classList.add('bleed');
      leftPage.setPreference('left');
      leftPage.setOutOfFlow(true);

      rightPage.element.classList.add('bindery-spread');
      rightPage.element.classList.add('bleed');
      rightPage.setPreference('right');
      rightPage.setOutOfFlow(true);

      state.currentPage = this.prevPage;
      state.path = this.prevElementPath;
    }
  }]);

  return Spread;
}(_BinderyRule3.default);

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(33);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(3)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./spread.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./spread.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, ".bindery-spread.bindery-left .bindery-content {\n  /*width: 200%;*/\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: -100%;\n  bottom: 0;\n}\n.bindery-spread.bindery-right .bindery-content {\n  position: absolute;\n  top: 0;\n  left: -100%;\n  right: 0;\n  bottom: 0;\n}\n", ""]);

// exports


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new Footnote(userOptions);
};

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _BinderyRule2 = __webpack_require__(0);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Footnote = function (_BinderyRule) {
  _inherits(Footnote, _BinderyRule);

  function Footnote(options) {
    _classCallCheck(this, Footnote);

    options.name = 'Footnote';
    return _possibleConstructorReturn(this, (Footnote.__proto__ || Object.getPrototypeOf(Footnote)).call(this, options));
  }

  _createClass(Footnote, [{
    key: 'afterAdd',
    value: function afterAdd(elmt, state) {
      var number = state.currentPage.footer.querySelectorAll('.footnote').length;

      this.updateReference(elmt, number);

      var fn = (0, _hyperscript2.default)('.footnote');
      fn.innerHTML = this.customContent(elmt, number);
      state.currentPage.footer.appendChild(fn);
    }
  }, {
    key: 'updateReference',
    value: function updateReference(elmt, number) {
      elmt.insertAdjacentHTML('beforeEnd', '<sup>' + number + '</sup>');
    }
  }, {
    key: 'customContent',
    value: function customContent(elmt, number) {
      return number + ': Default footnote for "' + elmt.textContent.substr(0, 24) + '"';
    }
  }]);

  return Footnote;
}(_BinderyRule3.default);

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (options) {
  return new PageReference(options);
};

var _BinderyRule2 = __webpack_require__(0);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PageReference = function (_BinderyRule) {
  _inherits(PageReference, _BinderyRule);

  function PageReference(options) {
    _classCallCheck(this, PageReference);

    options.name = 'Page Reference';

    var _this = _possibleConstructorReturn(this, (PageReference.__proto__ || Object.getPrototypeOf(PageReference)).call(this, options));

    _this.references = {};
    return _this;
  }

  _createClass(PageReference, [{
    key: 'afterAdd',
    value: function afterAdd(elmt) {
      this.references[elmt.getAttribute('href')] = elmt;
      elmt.removeAttribute('href');
    }
  }, {
    key: 'afterBind',
    value: function afterBind(page) {
      var _this2 = this;

      Object.keys(this.references).forEach(function (ref) {
        if (page.element.querySelector(ref)) {
          _this2.updateReference(_this2.references[ref], page.number);
        }
      });
    }
  }, {
    key: 'updateReference',
    value: function updateReference(element, number) {
      element.insertAdjacentHTML('afterend', ' (Reference to page ' + number + ')');
    }
  }]);

  return PageReference;
}(_BinderyRule3.default);

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (options) {
  return new PageNumber(options);
};

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _BinderyRule2 = __webpack_require__(0);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

__webpack_require__(37);

var PageNumber = function (_BinderyRule) {
  _inherits(PageNumber, _BinderyRule);

  function PageNumber() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PageNumber);

    options.name = 'Page Number';

    var _this = _possibleConstructorReturn(this, (PageNumber.__proto__ || Object.getPrototypeOf(PageNumber)).call(this, options));

    _this.selector = '.content';
    _this.customClass = options.customClass;
    return _this;
  }

  _createClass(PageNumber, [{
    key: 'afterBind',
    value: function afterBind(pg, i) {
      pg.number = i + 1;
      var el = (0, _hyperscript2.default)('.bindery-num', '' + pg.number);
      if (this.customClass) {
        el.classList.add(this.customClass);
      }
      pg.element.appendChild(el);
    }
  }]);

  return PageNumber;
}(_BinderyRule3.default);

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(38);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(3)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./pageNumber.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./pageNumber.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "@media screen {\n  .bindery-show-guides .bindery-num {\n    outline: 1px solid cyan;\n  }\n}\n\n.bindery-num {\n  position: absolute;\n  text-align: center;\n  bottom: 32px;\n  -webkit-user-select: none;\n  font-family: Verdana, sans-serif;\n  font-size: 0.667rem;\n}\n\n.bindery-left .bindery-num {\n  left: 20px;\n}\n.bindery-right .bindery-num {\n  right: 20px;\n}\n", ""]);

// exports


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new RunningHeader(userOptions);
};

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _BinderyRule2 = __webpack_require__(0);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

__webpack_require__(40);

var RunningHeader = function (_BinderyRule) {
  _inherits(RunningHeader, _BinderyRule);

  function RunningHeader(options) {
    _classCallCheck(this, RunningHeader);

    options.name = 'Running Header';

    var _this = _possibleConstructorReturn(this, (RunningHeader.__proto__ || Object.getPrototypeOf(RunningHeader)).call(this, options));

    _this.customClass = options.customClass;
    _this.currentHeaderContent = '';
    return _this;
  }

  _createClass(RunningHeader, [{
    key: 'afterAdd',
    value: function afterAdd(elmt, state) {
      this.currentHeaderContent = elmt.textContent;
      state.currentPage.runningHeader.textContent = '';
    }
  }, {
    key: 'afterPageCreated',
    value: function afterPageCreated(page) {
      var el = (0, _hyperscript2.default)('.bindery-running-header');
      if (this.customClass) {
        el.classList.add(this.customClass);
      }
      page.runningHeader = el;
      page.element.appendChild(el);
      page.runningHeader.textContent = this.currentHeaderContent;
    }
  }]);

  return RunningHeader;
}(_BinderyRule3.default);

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(41);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(3)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./runningHeader.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./runningHeader.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "@media screen {\n  .bindery-show-guides .bindery-running-header {\n    outline: 1px solid cyan;\n  }\n}\n\n.bindery-running-header {\n  position: absolute;\n  text-align: center;\n  top: 24px;\n  margin: auto;\n  font-size: 0.5em;\n  -webkit-user-select: none;\n  text-transform: uppercase;\n  letter-spacing: 0.15em;\n  font-family: Verdana, sans-serif;\n}\n\n.bindery-left .bindery-running-header {\n  text-align: right;\n  left: 24px;\n  transform: rotateZ(-90deg) translate3d(-100%,0,0);\n  transform-origin: top left;\n  /*right: 40px;*/\n}\n.bindery-right .bindery-running-header {\n  text-align: left;\n  right: 24px;\n  transform: rotateZ(90deg) translate3d(100%,0,0);\n  transform-origin: top right;\n}\n", ""]);

// exports


/***/ })
/******/ ]);
//# sourceMappingURL=bindery.js.map