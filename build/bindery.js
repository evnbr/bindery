// [AIV]  Build version: 2.0.0-alpha.2 - Saturday, July 29th, 2017, 3:05:40 PM  
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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var split = __webpack_require__(9)
var ClassList = __webpack_require__(10)

var w = typeof window === 'undefined' ? __webpack_require__(12) : window
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
/* 1 */
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

// const isValidRegEx = /^[+-]?[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)$/;
var cssNumberRegEx = /^([+-]?[0-9]+.?([0-9]+)?)(px|in|cm|mm|pt|pc)$/;
var cssNumberPattern = '^([+-]?[0-9]+.?([0-9]+)?)(px|in|cm|mm|pt|pc)$';

var isValidLength = function isValidLength(str) {
  return cssNumberRegEx.test(str);
};
var isValidSize = function isValidSize(size) {
  Object.keys(size).forEach(function (k) {
    if (!isValidLength(size[k])) {
      if (typeof size[k] === 'number') {
        throw Error('Size is missing units { ' + k + ': ' + size[k] + ' }');
      } else {
        throw Error('Invalid size { ' + k + ': ' + size[k] + ' }');
      }
    }
  });
};

var parseVal = function parseVal(str) {
  var matches = str.match(cssNumberRegEx);
  return {
    val: Number(matches[1]),
    unit: matches[3]
  };
};

var convertStrToPx = function convertStrToPx(str) {
  var parts = parseVal(str);
  return unitToPx(parts.val, parts.unit);
};

var convertStrToStr = function convertStrToStr(str, to) {
  var parts = parseVal(str);
  return '' + pxToUnit(unitToPx(parts.val, parts.unit), to) + to;
};

exports.cssNumberPattern = cssNumberPattern;
exports.parseVal = parseVal;
exports.isValidLength = isValidLength;
exports.isValidSize = isValidSize;
exports.convert = convert;
exports.convertStrToStr = convertStrToStr;
exports.convertStrToPx = convertStrToPx;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hyperscript = __webpack_require__(0);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _convertUnits = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(13);

var Page = function () {
  function Page() {
    _classCallCheck(this, Page);

    this.flowContent = (0, _hyperscript2.default)('.bindery-content');
    this.flowBox = (0, _hyperscript2.default)('.bindery-flowbox', this.flowContent);
    this.footer = (0, _hyperscript2.default)('footer.bindery-footer');
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
  }, {
    key: 'isEmpty',
    get: function get() {
      return this.element.textContent.trim() === '';
    }
  }, {
    key: 'isLeft',
    get: function get() {
      return this.side === 'left';
    }
  }, {
    key: 'isRight',
    get: function get() {
      return this.side === 'right';
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
        height: Page.H,
        width: Page.W
      };
    }
  }, {
    key: 'spreadSizeStyle',
    value: function spreadSizeStyle() {
      var w = (0, _convertUnits.parseVal)(Page.W);
      return {
        height: Page.H,
        width: '' + w.val * 2 + w.unit
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
      sheet.innerHTML = '\n      .bindery-flowbox,\n      .bindery-footer {\n        margin-left: ' + margin.inner + ';\n        margin-right: ' + margin.outer + ';\n      }\n      .bindery-left .bindery-flowbox,\n      .bindery-left .bindery-footer {\n        margin-left: ' + margin.outer + ';\n        margin-right: ' + margin.inner + ';\n      }\n\n      .bindery-left .bindery-num,\n      .bindery-left .bindery-running-header {\n        left: ' + margin.outer + ';\n      }\n      .bindery-right .bindery-num,\n      .bindery-right .bindery-running-header {\n        right: ' + margin.outer + ';\n      }\n\n      .bindery-flowbox { margin-top: ' + margin.top + '; }\n      .bindery-footer { margin-bottom: ' + margin.bottom + '; }\n    ';
      document.head.appendChild(sheet);
    }
  }]);

  return Page;
}();

exports.default = Page;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _paginate = __webpack_require__(7);

var _paginate2 = _interopRequireDefault(_paginate);

var _page = __webpack_require__(5);

var _page2 = _interopRequireDefault(_page);

var _viewer = __webpack_require__(15);

var _viewer2 = _interopRequireDefault(_viewer);

var _controls = __webpack_require__(22);

var _controls2 = _interopRequireDefault(_controls);

var _convertUnits = __webpack_require__(4);

var _Rules = __webpack_require__(30);

var _Rules2 = _interopRequireDefault(_Rules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_PAGE_UNIT = 'pt';
var DEFAULT_PAGE_SIZE = {
  width: '288pt',
  height: '432pt'
};
var DEFAULT_PAGE_MARGIN = {
  inner: '24pt',
  outer: '32pt',
  bottom: '54pt',
  top: '48pt'
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

var Bindery = function () {
  function Bindery(opts) {
    var _this = this;

    _classCallCheck(this, Bindery);

    console.log('Bindery ' + '2.0.0-alpha.2');

    var pageSize = opts.pageSize ? opts.pageSize : DEFAULT_PAGE_SIZE;
    var pageMargin = opts.pageMargin ? opts.pageMargin : DEFAULT_PAGE_MARGIN;
    this.pageUnit = opts.pageUnit ? opts.pageUnit : DEFAULT_PAGE_UNIT;
    this.setSize(pageSize);
    this.setMargin(pageMargin);

    this.viewer = new _viewer2.default();
    if (opts.startingView) {
      this.viewer.setMode(opts.startingView);
    }

    this.rules = [];
    if (opts.rules) this.addRules(opts.rules);

    if (opts.autorun) {
      this.runImmeditately = true;
    }

    this.autoupdate = opts.autoupdate ? opts.autoupdate : false;
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

  // Convenience constructor


  _createClass(Bindery, [{
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
      (0, _convertUnits.isValidSize)(size);

      this.pageSize = size;
      _page2.default.setSize(size);
    }
  }, {
    key: 'setMargin',
    value: function setMargin(margin) {
      (0, _convertUnits.isValidSize)(margin);

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
        var w = this.pageSize.width;
        var h = this.pageSize.height;
        var size = '{ width: ' + w + ', height: ' + h + ' }';
        var i = this.pageMargin.inner;
        var o = this.pageMargin.outer;
        var t = this.pageMargin.top;
        var b = this.pageMargin.bottom;
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

      if (this.autoupdate) {
        this.layoutChecker = setInterval(function () {
          _this4.checkLayoutChange();
        }, 500);
      }
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
  }], [{
    key: 'makeBook',
    value: function makeBook() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      opts.autorun = opts.autorun ? opts.autorun : true;
      return new Bindery(opts);
    }
  }]);

  return Bindery;
}();

Object.keys(_Rules2.default).forEach(function (rule) {
  Bindery[rule] = _Rules2.default[rule];
});

module.exports = Bindery;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elementToString = __webpack_require__(8);

var _elementToString2 = _interopRequireDefault(_elementToString);

var _page = __webpack_require__(5);

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SHOULD_DEBUG_TEXT = false;

var last = function last(arr) {
  return arr[arr.length - 1];
};

// TODO: only do this if not double sided?
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
  var MAX_CALLS = 500;
  var numberOfCalls = 0;
  var throttle = function throttle(func, shouldPause) {
    if (shouldPause) {
      window.paginateStep = func;
    } else if (DELAY > 0) {
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
      throw Error('Overflowed');
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

  var makeSpacerPage = function makeSpacerPage() {
    var newPage = new _page2.default();
    newPage.creationOrder = state.pages.length;
    newPageRules(newPage);
    return newPage;
  };

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
          pages.splice(i, 0, makeSpacerPage());
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

  var beforeAddRules = function beforeAddRules(element) {
    var addedElement = element;
    rules.forEach(function (rule) {
      if (!rule.selector) return;
      if (addedElement.matches(rule.selector) && rule.beforeAdd) {
        addedElement = rule.beforeAdd(addedElement, state, makeNextPage);
      }
    });
  };

  var afterAddRules = function afterAddRules(element) {
    var addedElement = element;
    rules.forEach(function (rule) {
      if (!rule.selector) return;
      if (addedElement.matches(rule.selector) && rule.afterAdd) {
        addedElement = rule.afterAdd(addedElement, state, makeNextPage, function overflowCallback() {
          // TODO:
          // While this does catch overflows, it introduces a few new bugs.
          // It is pretty aggressive to move the entire node to the next page.
          // - 1. there is no guarentee it will fit on the new page
          // - 2. if it has childNodes, those rules will not be invalidated,
          // which means footnotes will get left ona previous page.
          // - 3. if it is a large paragraph, it will leave a large gap. the
          // correct approach would be to only need to invalidate
          // the last line of text.
          addedElement.parentNode.removeChild(addedElement);
          makeNextPage();
          last(state.path).appendChild(addedElement);
          addedElement = rule.afterAdd(addedElement, state, makeNextPage, function () {
            console.log('Couldn\'t apply ' + rule.name + ' to ' + (0, _elementToString2.default)(addedElement) + '. Caused overflows twice.');
          });
        });
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
    state.path.pop(); // TODO: this is unclear.

    // remove from old page
    nodeToMove.parentNode.removeChild(nodeToMove);

    state.currentPage = makeNextPage();

    // append to new page
    last(state.path).appendChild(nodeToMove);

    state.path.push(nodeToMove);
  };

  // Adds an text node by incrementally adding words
  // until it just barely doesnt overflow
  var addTextNode = function addTextNode(originalNode, doneCallback, abortCallback) {
    var textNode = originalNode;
    var origText = textNode.nodeValue;
    last(state.path).appendChild(textNode);

    if (!state.currentPage.hasOverflowed()) {
      throttle(doneCallback);
      return;
    }

    var pos = 0;

    var splitTextStep = function splitTextStep() {
      textNode.nodeValue = origText.substr(0, pos);

      if (state.currentPage.hasOverflowed()) {
        // Back out to word boundary
        if (origText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
        while (origText.charAt(pos) !== ' ' && pos > 0) {
          pos -= 1;
        }if (pos < 1) {
          textNode.nodeValue = origText;
          textNode.parentNode.removeChild(textNode);
          abortCallback();
          return;
        }

        var fittingText = origText.substr(0, pos);
        var overflowingText = origText.substr(pos);
        textNode.nodeValue = fittingText;
        origText = overflowingText;

        pos = 0;

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

        throttle(splitTextStep);
        return;
      }
      if (pos > origText.length - 1) {
        throttle(doneCallback);
        return;
      }

      pos += 1;
      while (origText.charAt(pos) !== ' ' && pos < origText.length) {
        pos += 1;
      }throttle(splitTextStep, SHOULD_DEBUG_TEXT);
    };

    splitTextStep();
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  var addElementNode = function addElementNode(node, doneCallback) {
    if (state.currentPage.hasOverflowed()) {
      // node.style.outline = "1px solid red";
      console.error('Bindery: Trying to add node to a page that\'s already overflowing');
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

    if (state.currentPage.hasOverflowed()) {
      console.error('Bindery: Adding ' + (0, _elementToString2.default)(node) + ' causes overflow even when empty');
      moveNodeToNextPage(node);
    }

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
              moveNodeToNextPage(node);
              addTextNode(child, addNextChild, abortCallback);
            };
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

            throttle(function addChildAsElement() {
              addElementNode(child, function addedChildSuccess() {
                // TODO: Because addElementNode will push node onto the path again
                var addedChild = state.path.pop();
                // let addedChild = last(state.path);

                // TODO: AfterAdd rules may want to access original child, not split second half
                afterAddRules(addedChild);

                if (state.currentPage.hasOverflowed()) {
                  console.log('wasn\'t really a success was it');
                }
                addNextChild();
              });
            });
            break;
          }
        default:
          // Skip unknown nodes
          addNextChild();
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
        page.number = i + 1;
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
/* 8 */
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
    text = '("' + node.textContent.substr(0, 30).replace(/\s+/g, ' ') + '...")';
  }
  return tag + id + classes + text;
};

exports.default = elementToString;

/***/ }),
/* 9 */
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

// contains, add, remove, toggle
var indexof = __webpack_require__(11)

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
/* 11 */
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
/* 12 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(14);
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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "@media screen {\n  .bindery-page {\n    background: white;\n    outline: 1px solid rgba(0,0,0,0.1);\n    box-shadow: 0px 1px 3px rgba(0,0,0,0.2);\n    overflow: hidden;\n  }\n  .bindery-show-bleed .bindery-page {\n    box-shadow: none;\n    outline: none;\n    overflow: visible;\n  }\n  .bindery-page3d .bindery-page {\n    overflow: hidden !important;\n  }\n\n\n  .bindery-page::after {\n    content: \"\";\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    pointer-events: none;\n    z-index: 999;\n  }\n\n\n  .bindery-export * {\n    transition: box-shadow 0.5s;\n  }\n\n  .bindery-show-guides * {\n    box-shadow: inset 0 0 0 1px rgba(0, 92, 255, 0.2);\n  }\n\n  .bindery-show-guides .bindery-page::after {\n    box-shadow: 0 0 0 1px magenta;\n  }\n\n  .bindery-show-guides .bindery-flowbox {\n    box-shadow: 0 0 0 1px cyan;\n  }\n  .bindery-show-guides .bindery-footer {\n    box-shadow: 0 0 0 1px cyan;\n  }\n  .bindery-show-guides .bindery-running-header {\n    box-shadow: 0 0 0 1px cyan;\n  }\n  .bindery-show-guides .bindery-content {\n    box-shadow: inset 0 0 0 1px blue;\n  }\n  .bindery-show-guides .bindery-bleed {\n    box-shadow: 0 0 0 1px yellow;\n  }\n\n}\n\n.bindery-page {\n  /*width: 400px;*/\n  /*height: 600px;*/\n  width: 200px;\n  height: 300px;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  flex-wrap: nowrap;\n  margin: auto;\n}\n\n.bindery-flowbox {\n  position: relative;\n  margin: 60px 40px;\n  margin-bottom: 0;\n  flex: 1 1 auto;\n  min-height: 0;\n}\n.bindery-content {\n  /* hack to prevent margin collapse, leading to wrong height */\n  padding: 0.1px;\n}\n\n/* Footer */\n.bindery-footer {\n  margin: 60px 40px;\n  margin-top: 8pt;\n  flex: 0 1 auto;\n  z-index: 2;\n}\n.bindery-footer > :first-child:before {\n  content: \"\";\n  display: block;\n  width: 24pt;\n  height: 1px;\n  box-shadow: inset 0 0.5px 0 0 black;\n  margin-bottom: 8pt;\n}\n\n[bindery-continuation] {\n  text-indent: 0 !important;\n  margin-top: 0 !important;\n}\n\n/*Old Bleed Stuff*/\n.bindery-page.bleed .bindery-flowbox {\n  margin: 0;\n  position: absolute;\n  top: -20px;\n  bottom: -20px;\n}\n.bindery-left.bleed .bindery-flowbox {\n  right: 0;\n  left: -20px;\n}\n.bindery-right.bleed .bindery-flowbox {\n  left: 0;\n  right: -20px;\n}\n\n/*Bleed as layer*/\n.bindery-bleed {\n  position: absolute;\n  top: -0.2in;\n  bottom: -0.2in;\n  z-index: 0;\n}\n.bindery-left .bindery-bleed {\n  right: 0;\n  left: -0.2in;\n}\n.bindery-right .bindery-bleed {\n  left: 0;\n  right: -0.2in;\n}\n\n.bindery-measure-area {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n", ""]);

// exports


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hyperscript = __webpack_require__(0);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _page = __webpack_require__(5);

var _page2 = _interopRequireDefault(_page);

var _error = __webpack_require__(16);

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(17);
__webpack_require__(20);

var MODE_FLIP = 'interactive';
var MODE_PREVIEW = 'grid';
var MODE_SHEET = 'print';
var MODE_OUTLINE = 'outline';

var ARRANGE_ONE = 'arrange_one';
var ARRANGE_SPREAD = 'arrange_two';
var ARRANGE_BOOKLET = 'arrange_booklet';
// const ARRANGE_SIGNATURE = 'arrange_signature';


var cropMarksSingle = function cropMarksSingle() {
  return (0, _hyperscript2.default)('.bindery-crop-wrap', (0, _hyperscript2.default)('.bindery-crop-top'), (0, _hyperscript2.default)('.bindery-crop-bottom'), (0, _hyperscript2.default)('.bindery-crop-left'), (0, _hyperscript2.default)('.bindery-crop-right'));
};
var cropMarksSpread = function cropMarksSpread() {
  return (0, _hyperscript2.default)('.bindery-crop-wrap', (0, _hyperscript2.default)('.bindery-crop-top'), (0, _hyperscript2.default)('.bindery-crop-bottom'), (0, _hyperscript2.default)('.bindery-crop-left'), (0, _hyperscript2.default)('.bindery-crop-right'), (0, _hyperscript2.default)('.bindery-crop-fold'));
};

var ORIENTATION_STYLE_ID = 'bindery-orientation-stylesheet';

var setOrientationCSS = function setOrientationCSS(newValue) {
  var sheet = void 0;
  var existing = document.querySelector('#' + ORIENTATION_STYLE_ID);
  if (existing) {
    sheet = existing;
  } else {
    sheet = document.createElement('style');
    sheet.id = ORIENTATION_STYLE_ID;
  }
  sheet.innerHTML = '@page { size: ' + newValue + '; }';
  document.head.appendChild(sheet);
};

var Viewer = function () {
  function Viewer() {
    _classCallCheck(this, Viewer);

    this.pages = [];

    this.export = (0, _hyperscript2.default)('.bindery-export');

    this.doubleSided = true;
    this.printArrange = ARRANGE_SPREAD;
    this.isShowingCropMarks = true;
    this.setOrientation('landscape');

    this.mode = MODE_PREVIEW;
    this.currentLeaf = 0;

    this.listenForPrint();
  }

  _createClass(Viewer, [{
    key: 'listenForPrint',
    value: function listenForPrint() {
      var _this = this;

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
  }, {
    key: 'setOrientation',
    value: function setOrientation(newVal) {
      if (newVal === this.orientation) return;
      this.orientation = newVal;
      setOrientationCSS(newVal);
      if (this.mode === MODE_SHEET) {
        this.update();
      }
    }
  }, {
    key: 'setPrintArrange',
    value: function setPrintArrange(newVal) {
      if (newVal === this.printArrange) return;
      this.printArrange = newVal;
      if (this.mode === MODE_SHEET) {
        this.update();
      }
    }
  }, {
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
          this.mode = MODE_PREVIEW;
          break;
        case 'interactive':
        case 'flip':
        case '3d':
          this.mode = MODE_FLIP;
          break;
        case 'print':
        case 'sheet':
          this.mode = MODE_SHEET;
          break;
        case 'outline':
        case 'outlines':
        case 'guides':
          this.mode = MODE_OUTLINE;
          break;
        default:
          console.error('Bindery: Unknown view mode "' + newMode + '"');
          break;
      }
    }
  }, {
    key: 'setGrid',
    value: function setGrid() {
      if (this.mode === MODE_PREVIEW) return;
      if (this.mode === MODE_OUTLINE) {
        this.mode = MODE_PREVIEW;
        this.updateGuides();
      } else {
        this.mode = MODE_PREVIEW;
        this.update();
      }
    }
  }, {
    key: 'setOutline',
    value: function setOutline() {
      if (this.mode === MODE_OUTLINE) return;
      if (this.mode === MODE_PREVIEW) {
        this.mode = MODE_OUTLINE;
        this.updateGuides();
      } else {
        this.mode = MODE_OUTLINE;
        this.update();
      }
    }
  }, {
    key: 'setPrint',
    value: function setPrint() {
      if (this.mode === MODE_SHEET) return;
      this.mode = MODE_SHEET;
      this.update();
    }
  }, {
    key: 'setInteractive',
    value: function setInteractive() {
      this.mode = MODE_FLIP;
      this.update();
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this.export.parentNode) {
        document.body.appendChild(this.export);
      }

      document.body.classList.add('bindery-viewing');

      if (this.mode === MODE_PREVIEW) {
        this.renderGrid();
      } else if (this.mode === MODE_OUTLINE) {
        this.renderGrid();
      } else if (this.mode === MODE_FLIP) {
        this.renderInteractive();
      } else if (this.mode === MODE_SHEET) {
        this.renderPrint();
      } else {
        this.renderGrid();
      }
    }
  }, {
    key: 'renderPrint',
    value: function renderPrint() {
      this.mode = MODE_SHEET;
      this.export.style.display = 'block';

      this.export.classList.add('bindery-show-bleed');
      this.export.classList.remove('bindery-show-guides');

      this.export.innerHTML = '';

      var pages = this.pages.slice();
      var isTwoUp = this.printArrange !== ARRANGE_ONE;

      var spread = function spread() {
        for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
          arg[_key] = arguments[_key];
        }

        return _hyperscript2.default.apply(undefined, ['.bindery-spread-wrapper'].concat(arg));
      };
      var orient = this.orientation;
      var printSheet = function printSheet() {
        for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          arg[_key2] = arguments[_key2];
        }

        return _hyperscript2.default.apply(undefined, ['.bindery-print-page.bindery-letter-' + orient].concat(arg));
      };

      if (this.printArrange === ARRANGE_SPREAD) {
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
      if (this.printArrange === ARRANGE_BOOKLET) {
        while (pages.length % 4 !== 0) {
          var _spacerPage = new _page2.default();
          _spacerPage.element.style.visibility = 'hidden';
          pages.push(_spacerPage);
        }
        var bookletOrder = [];
        var len = pages.length;

        for (var i = 0; i < len / 2; i += 2) {
          bookletOrder.push(pages[len - 1 - i]);
          bookletOrder.push(pages[i]);
          bookletOrder.push(pages[i + 1]);
          bookletOrder.push(pages[len - 2 - i]);
        }

        pages = bookletOrder;
      }

      for (var _i = 0; _i < pages.length; _i += isTwoUp ? 2 : 1) {
        if (isTwoUp) {
          var left = pages[_i];
          var right = pages[_i + 1];

          var leftPage = left.element;
          var rightPage = right.element;

          var sheet = printSheet(spread({ style: _page2.default.spreadSizeStyle() }, leftPage, rightPage, cropMarksSpread()));

          if (this.printArrange === ARRANGE_BOOKLET) {
            var isFront = _i % 4 === 0;
            var sheetIndex = parseInt((_i + 1) / 4, 10) + 1;
            var meta = (0, _hyperscript2.default)('.bindery-print-meta', 'Sheet ' + sheetIndex + ' of ' + pages.length / 4 + ': ' + (isFront ? 'Outside' : 'Inside'));
            sheet.appendChild(meta);
          }

          this.export.appendChild(sheet);
        } else {
          var _pg = pages[_i].element;
          var _sheet = printSheet(spread({ style: _page2.default.sizeStyle() }, _pg, cropMarksSingle()));
          this.export.appendChild(_sheet);
        }
      }
    }
  }, {
    key: 'updateGuides',
    value: function updateGuides() {
      if (this.mode === MODE_OUTLINE) {
        this.export.classList.add('bindery-show-bleed');
        this.export.classList.add('bindery-show-guides');
      } else {
        this.export.classList.remove('bindery-show-bleed');
        this.export.classList.remove('bindery-show-guides');
      }
    }
  }, {
    key: 'renderGrid',
    value: function renderGrid() {
      this.updateGuides();
      this.export.style.display = 'block';

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
          var _wrap = (0, _hyperscript2.default)('.bindery-print-page', (0, _hyperscript2.default)('.bindery-spread-wrapper', {
            style: _page2.default.sizeStyle()
          }, _pg2));
          this.export.appendChild(_wrap);
        }
      }
    }
  }, {
    key: 'renderInteractive',
    value: function renderInteractive() {
      var _this2 = this;

      this.mode = MODE_FLIP;
      this.export.style.display = 'block';
      this.export.innerHTML = '';
      this.flaps = [];

      this.export.classList.remove('bindery-show-bleed');
      this.export.classList.remove('bindery-show-guides');

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
  }, {
    key: 'isShowingCropMarks',
    get: function get() {
      return this.export.classList.contains('bindery-show-crop');
    },
    set: function set(newVal) {
      if (newVal) {
        this.export.classList.add('bindery-show-crop');
      } else {
        this.export.classList.remove('bindery-show-crop');
      }
    }
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (title, text) {
  return (0, _hyperscript2.default)('.bindery-error', (0, _hyperscript2.default)('.bindery-error-title', title), (0, _hyperscript2.default)('.bindery-error-text', text), (0, _hyperscript2.default)('.bindery-error-footer', 'Bindery.js v0.1 Alpha'));
};

var _hyperscript = __webpack_require__(0);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(18);
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "@media screen {\n  .bindery-viewing {\n    background: #f1f1f1 !important;\n  }\n  .bindery-export {\n    transition: opacity 0.2s;\n    opacity: 1;\n    background: #f1f1f1;\n    padding: 50px 20px;\n    z-index: 99;\n    position: relative;\n    padding-right: 240px;\n    animation: fadeUp 0.3s;\n    min-height: 100vh;\n    /*min-width: calc(11in + 320px);*/\n  }\n\n   .bindery-measure-area {\n     position: fixed;\n     top: 0;\n     left: 0;\n     background: #f1f1f1;\n     padding: 50px 20px;\n     padding-right: 240px;\n     z-index: 99;\n   }\n\n   .bindery-print-page {\n     margin: 0 auto;\n   }\n\n   .bindery-error {\n     font-family: -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n     font-size: 16px;\n     margin: 15vh 15vw;\n     max-width: 500px;\n     background: url(" + __webpack_require__(19) + ") no-repeat 0% 0%;\n     background-size: 48px;\n     padding-top: 64px;\n   }\n\n   .bindery-error-title {\n     font-size: 1.5em;\n     margin-bottom: 16px;\n   }\n\n   .bindery-error-text {\n     margin-bottom: 16px;\n     white-space: pre-line;\n   }\n\n   .bindery-error-footer {\n     opacity: 0.5;\n     font-size: 0.66rem;\n     text-transform: uppercase;\n     letter-spacing: 0.02em;\n   }\n\n   .bindery-show-bleed .bindery-print-page {\n     background: white;\n     outline: 1px solid rgba(0,0,0,0.1);\n     box-shadow: 0px 1px 3px rgba(0,0,0,0.2);\n     margin: 20px auto;\n   }\n\n   .bindery-letter-landscape {\n     width: 11in;\n     height: 8.5in;\n   }\n   .bindery-letter-portrait {\n     width: 8.5in;\n     height: 11in;\n   }\n\n}\n\n@keyframes fadeUp {\n  0% {\n    opacity: 0;\n    /*transform: translate3d(0, 50px, 0);*/\n  }\n  100% {\n    opacity: 1;\n    /*transform: translate3d(0, 0, 0);*/\n  }\n}\n\n@page {\n  margin: 0;\n}\n\n@media print {\n  .bindery-export {\n    -webkit-print-color-adjust: exact;\n  }\n\n  /* Don't print anything that hasn't been exported. This hides extra controls/ */\n  .bindery-viewing > :not(.bindery-export) {\n    display: none !important;\n  }\n\n  .bindery-print-page {\n    margin: 20px;\n  }\n\n}\n\nbody.bindery-viewing {\n  margin: 0;\n}\n\n/* Don't print anything that hasn't been exported. This hides extra controls/ */\n.bindery-viewing > :not(.bindery-export) {\n  display: none !important;\n}\n\n.bindery-print-page {\n  page-break-after: always;\n  position: relative;\n  overflow: hidden;\n}\n\n.bindery-spread-wrapper {\n  position: relative;\n  display: flex;\n  width: 800px;\n  margin: 50px auto;\n}\n\n.bindery-print-page .bindery-spread-wrapper {\n  margin: 0 auto;\n}\n\n.bindery-print-meta {\n  padding: 12pt;\n  text-align: center;\n  font-family: -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n  font-size: 8pt;\n}\n\n.bindery-stage3d {\n  perspective: 3000px;\n  min-height: 100vh;\n  transform-style: preserve-3d;\n}\n\n.bindery-page3d {\n  margin: auto;\n  width: 400px;\n  height: 600px;\n  transform: rotateY(0);\n  transition: transform 0.5s, box-shadow 0.1s;\n  transform-style: preserve-3d;\n  transform-origin: left;\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n}\n\n.bindery-page3d:hover {\n  box-shadow: 2px 0 4px rgba(0,0,0,0.2);\n}\n.bindery-page3d.flipped {\n  transform: rotateY(-180deg);\n}\n\n.bindery-page3d .bindery-page {\n  position: absolute;\n  backface-visibility: hidden;\n}\n\n.bindery-page3d .bindery-page3d-front {\n  transform: rotateY(0);\n}\n.bindery-page3d .bindery-page3d-back {\n  transform: rotateY(-180deg);\n}\n\n.bindery-page3d .bindery-page3d-front::after {\n  box-shadow: inset 12px 0 12px -12px rgba(0,0,0,0.4)\n}\n.bindery-page3d .bindery-page3d-back::after {\n  box-shadow: inset -12px 0 12px -12px rgba(0,0,0,0.4)\n}\n", ""]);

// exports


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3Cpath id='a' d='M0 4H15V27H0z'/%3E%3Cpath id='b' d='M15 4H30V27H15z'/%3E%3Cpath id='c' d='M14 4.07147535L27 0 27 22.9285247 14 27z'/%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg transform='translate(3 2)'%3E%3Cuse fill='%23FFFFFF' xlink:href='%23a'/%3E%3Cpath stroke='%23000000' d='M0.5 4.5H14.5V26.5H0.5z'/%3E%3C/g%3E%3Cg transform='translate(3 2)'%3E%3Cuse fill='%23FFFFFF' xlink:href='%23b'/%3E%3Cpath stroke='%23000000' d='M15.5 4.5H29.5V26.5H15.5z'/%3E%3C/g%3E%3Cg transform='translate(3 2)'%3E%3Cuse fill='%23FFFFFF' xlink:href='%23c'/%3E%3Cpath stroke='%23000000' d='M14.5,4.43882867 L14.5,26.3194563 L26.5,22.5611713 L26.5,0.680543732 L14.5,4.43882867 Z'/%3E%3C/g%3E%3Cpath fill='%23000000' opacity='.3' d='M16.3241613 26.7071852L25.7154453 22.615177 26.1596848 4.74924377 28 4.30920273 28 27z' transform='translate(3 2)'/%3E%3Ccircle fill='%23000000' cx='11' cy='14' r='1'/%3E%3Ccircle fill='%23000000' cx='11' cy='21' r='1'/%3E%3Cpath d='M28.1793786,11.0743011 C24.667534,11.0743011 21.8206214,13.9212136 21.8206214,17.4330583' stroke='%23000000' transform='rotate(-45 25 14.254)'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(21);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(3)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./crop.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./crop.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, ".bindery-crop-wrap {\n  display: none;\n  position: absolute;\n  pointer-events: none;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 999;\n}\n.bindery-show-crop .bindery-crop-wrap {\n  display: block;\n}\n.bindery-show-crop .bindery-print-page .bindery-spread-wrapper {\n  margin: 30pt auto;\n}\n\n\n.bindery-crop-wrap > div {\n  position: absolute;\n  overflow: hidden;\n}\n.bindery-crop-wrap > div::after,\n.bindery-crop-wrap > div::before {\n  content: \"\";\n  background: black;\n  width: 12pt;\n  height: 12pt;\n  display: block;\n  position: absolute;\n}\n\n.bindery-crop-wrap > div::before {\n  top: 0; left: 0;\n}\n\n.bindery-crop-wrap > div::after {\n  bottom: 0; right: 0;\n}\n\n.bindery-crop-fold,\n.bindery-crop-left,\n.bindery-crop-right {\n  transform: scaleX(0.5);\n  top: -20pt;\n  bottom: -20pt;\n  width: 1px;\n  margin: auto;\n}\n\n.bindery-crop-fold { right: 0; left: 0; }\n.bindery-crop-left { left: 0; }\n.bindery-crop-right { right: 0; }\n\n.bindery-crop-top,\n.bindery-crop-bottom {\n  transform: scaleY(0.5);\n  left: -20pt;\n  right: -20pt;\n  height: 1px;\n}\n.bindery-crop-top { top: 0; }\n.bindery-crop-bottom { bottom: 0; }\n", ""]);

// exports


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperscript = __webpack_require__(0);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _convertUnits = __webpack_require__(4);

var _components = __webpack_require__(23);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(24);

var ControlPanel = function ControlPanel(opts) {
  var _this = this;

  _classCallCheck(this, ControlPanel);

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

  var printBtn = (0, _components.btnMain)({ onclick: print }, 'Print');

  var layoutControl = void 0;
  var cropToggle = void 0;
  var facingToggle = void 0;

  var toggleCrop = function toggleCrop() {
    _this.binder.viewer.isShowingCropMarks = !_this.binder.viewer.isShowingCropMarks;
    cropToggle.classList.toggle('selected');
  };

  var toggleFacing = function toggleFacing() {
    facingToggle.classList.toggle('selected');
    layoutControl.classList.toggle('not-facing');
    _this.binder.viewer.toggleDouble();
  };

  cropToggle = (0, _components.switchRow)({ onclick: toggleCrop }, 'Crop Marks');
  cropToggle.classList.add('selected');
  facingToggle = (0, _components.switchRow)({ onclick: toggleFacing }, 'Facing Pages');

  facingToggle.classList.add('selected');

  var doneBtn = '';
  if (!this.binder.runImmeditately) {
    doneBtn = (0, _components.btn)({ onclick: done }, 'Done');
  }

  var unitInputs = {
    top: (0, _components.inputNumberUnits)(this.binder.pageMargin.top),
    inner: (0, _components.inputNumberUnits)(this.binder.pageMargin.inner),
    outer: (0, _components.inputNumberUnits)(this.binder.pageMargin.outer),
    bottom: (0, _components.inputNumberUnits)(this.binder.pageMargin.bottom),
    width: (0, _components.inputNumberUnits)(this.binder.pageSize.width),
    height: (0, _components.inputNumberUnits)(this.binder.pageSize.height)
  };

  var sizeControl = (0, _hyperscript2.default)('.bindery-val.bindery-size', (0, _hyperscript2.default)('div', 'W', unitInputs.width), (0, _hyperscript2.default)('div', 'H', unitInputs.height));

  var marginPreview = (0, _hyperscript2.default)('.preview');
  var marginControl = (0, _hyperscript2.default)('.bindery-val.bindery-margin', (0, _hyperscript2.default)('.top', unitInputs.top), (0, _hyperscript2.default)('.inner', unitInputs.inner), (0, _hyperscript2.default)('.outer', unitInputs.outer), (0, _hyperscript2.default)('.bottom', unitInputs.bottom), marginPreview);

  layoutControl = (0, _hyperscript2.default)('.bindery-layout-control', sizeControl, marginControl);

  var paperSize = (0, _components.row)('Paper Size', (0, _components.select)((0, _components.option)('Letter'), (0, _components.option)({ disabled: true }, '8.5 x 11'), (0, _components.option)({ disabled: true }, ''), (0, _components.option)({ disabled: true }, 'Legal'), (0, _components.option)({ disabled: true }, '8.5 x 14'), (0, _components.option)({ disabled: true }, ''), (0, _components.option)({ disabled: true }, 'Tabloid'), (0, _components.option)({ disabled: true }, '11 x 17'), (0, _components.option)({ disabled: true }, ''), (0, _components.option)({ disabled: true }, 'A4'), (0, _components.option)({ disabled: true }, 'mm x mm')));

  var arrangeSelect = (0, _components.select)((0, _components.option)({ value: 'arrange_one' }, 'Pages'), (0, _components.option)({ value: 'arrange_two', selected: true }, 'Spreads'), (0, _components.option)({ value: 'arrange_booklet' }, 'Booklet'), (0, _components.option)({ disabled: true }, 'Grid'), (0, _components.option)({ disabled: true }, 'Signatures'));
  arrangeSelect.addEventListener('change', function () {
    _this.binder.viewer.setPrintArrange(arrangeSelect.value);
  });
  var arrangement = (0, _components.row)('Print', arrangeSelect);

  var orientationSelect = (0, _components.select)((0, _components.option)({ value: 'landscape' }, 'Landscape'), (0, _components.option)({ value: 'portrait' }, 'Portrait'));
  orientationSelect.addEventListener('change', function () {
    _this.binder.viewer.setOrientation(orientationSelect.value);
  });
  var orientation = (0, _components.row)('Orientation', orientationSelect);

  var validCheck = (0, _hyperscript2.default)('div', { style: {
      display: 'none',
      color: '#e2b200'
    } }, 'Too Small');
  var inProgress = (0, _hyperscript2.default)('div', { style: {
      display: 'none'
    } }, 'Updating...');
  var forceRefresh = (0, _components.btn)({ onclick: function onclick() {
      inProgress.style.display = 'block';
      forceRefresh.style.display = 'none';
      setTimeout(function () {
        _this.binder.makeBook(function () {
          inProgress.style.display = 'none';
          forceRefresh.style.display = 'block';
        }, 100);
      });
    } }, 'Update Layout');

  var gridMode = void 0;
  var printMode = void 0;
  var outlineMode = void 0;
  var flipMode = void 0;
  var viewModes = void 0;
  var setGrid = function setGrid() {
    viewModes.forEach(function (v) {
      return v.classList.remove('selected');
    });
    gridMode.classList.add('selected');
    _this.binder.viewer.setGrid();
  };
  var setOutline = function setOutline() {
    viewModes.forEach(function (v) {
      return v.classList.remove('selected');
    });
    outlineMode.classList.add('selected');
    _this.binder.viewer.setOutline();
  };
  var setInteractive = function setInteractive() {
    viewModes.forEach(function (v) {
      return v.classList.remove('selected');
    });
    flipMode.classList.add('selected');
    _this.binder.viewer.setInteractive();
  };
  var setPrint = function setPrint() {
    viewModes.forEach(function (v) {
      return v.classList.remove('selected');
    });
    printMode.classList.add('selected');
    _this.binder.viewer.setPrint();
  };
  gridMode = (0, _hyperscript2.default)('.bindery-viewmode.grid', { onclick: setGrid }, (0, _hyperscript2.default)('.icon'), 'Preview');
  outlineMode = (0, _hyperscript2.default)('.bindery-viewmode.outline', { onclick: setOutline }, (0, _hyperscript2.default)('.icon'), 'Outline');
  flipMode = (0, _hyperscript2.default)('.bindery-viewmode.flip', { onclick: setInteractive }, (0, _hyperscript2.default)('.icon'), 'Flip');
  printMode = (0, _hyperscript2.default)('.bindery-viewmode.print', { onclick: setPrint }, (0, _hyperscript2.default)('.icon'), 'Sheet');
  viewModes = [gridMode, outlineMode, flipMode, printMode];

  if (this.binder.viewer.mode === 'grid') gridMode.classList.add('selected');
  if (this.binder.viewer.mode === 'interactive') flipMode.classList.add('selected');
  if (this.binder.viewer.mode === 'print') printMode.classList.add('selected');
  var viewSwitcher = _hyperscript2.default.apply(undefined, ['.bindery-viewswitcher'].concat(_toConsumableArray(viewModes)));

  var header = (0, _components.title)('Loading...');

  var updateLayoutPreview = function updateLayoutPreview(newSize, newMargin) {
    var px = {
      top: (0, _convertUnits.convertStrToPx)(newMargin.top),
      inner: (0, _convertUnits.convertStrToPx)(newMargin.inner),
      outer: (0, _convertUnits.convertStrToPx)(newMargin.outer),
      bottom: (0, _convertUnits.convertStrToPx)(newMargin.bottom),
      width: (0, _convertUnits.convertStrToPx)(newSize.width),
      height: (0, _convertUnits.convertStrToPx)(newSize.height)
    };

    var BASE = 90;
    var ratio = px.width / px.height;
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

    var t = px.top / px.height * height;
    var b = px.bottom / px.height * height;
    var o = px.outer / px.width * width;
    var i = px.inner / px.width * width;

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
      top: unitInputs.top.value,
      inner: unitInputs.inner.value,
      outer: unitInputs.outer.value,
      bottom: unitInputs.bottom.value
    };
    var newSize = {
      height: unitInputs.height.value,
      width: unitInputs.width.value
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

  Object.keys(unitInputs).forEach(function (k) {
    unitInputs[k].addEventListener('change', throttledUpdate);
    unitInputs[k].addEventListener('keyup', throttledUpdate);
  });

  var layoutState = (0, _hyperscript2.default)('div', forceRefresh, validCheck, inProgress);

  this.holder.appendChild((0, _hyperscript2.default)('div', {}, header, arrangement, paperSize, orientation, cropToggle, (0, _components.expandRow)('Book Setup'), (0, _components.expandArea)(layoutControl, layoutState), doneBtn, printBtn, viewSwitcher));
};

exports.default = ControlPanel;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inputNumberUnits = exports.switchRow = exports.option = exports.select = exports.btnMini = exports.btnMain = exports.btn = exports.heading = exports.expandArea = exports.expandRow = exports.row = exports.title = undefined;

var _hyperscript = __webpack_require__(0);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _convertUnits = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var title = function title() {
  for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
    arg[_key] = arguments[_key];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-title'].concat(arg));
};

// Structure
var heading = function heading() {
  for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    arg[_key2] = arguments[_key2];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-heading'].concat(arg));
};

var row = function row() {
  for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    arg[_key3] = arguments[_key3];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-toggle'].concat(arg));
};

var expandRow = function expandRow() {
  for (var _len4 = arguments.length, arg = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    arg[_key4] = arguments[_key4];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-expand-row', {
    onclick: function onclick() {
      this.classList.toggle('selected');
    }
  }].concat(arg));
};
var expandArea = function expandArea() {
  for (var _len5 = arguments.length, arg = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    arg[_key5] = arguments[_key5];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-expand-area'].concat(arg));
};

// Button
var btn = function btn() {
  for (var _len6 = arguments.length, arg = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    arg[_key6] = arguments[_key6];
  }

  return _hyperscript2.default.apply(undefined, ['button.bindery-btn'].concat(arg));
};

var btnMini = function btnMini() {
  for (var _len7 = arguments.length, arg = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    arg[_key7] = arguments[_key7];
  }

  return _hyperscript2.default.apply(undefined, ['button.bindery-btn.bindery-btn-mini'].concat(arg));
};

var btnMain = function btnMain() {
  for (var _len8 = arguments.length, arg = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    arg[_key8] = arguments[_key8];
  }

  return _hyperscript2.default.apply(undefined, ['button.bindery-btn.bindery-btn-main'].concat(arg));
};

// Menu
var select = function select() {
  for (var _len9 = arguments.length, arg = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
    arg[_key9] = arguments[_key9];
  }

  return _hyperscript2.default.apply(undefined, ['select'].concat(arg));
};

var option = function option() {
  for (var _len10 = arguments.length, arg = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
    arg[_key10] = arguments[_key10];
  }

  return _hyperscript2.default.apply(undefined, ['option'].concat(arg));
};

// Input
var inputNumberUnits = function inputNumberUnits(val) {
  return (0, _hyperscript2.default)('input', {
    type: 'text',
    value: val,
    pattern: _convertUnits.cssNumberPattern
  });
};

// Switch
var toggleSwitch = function toggleSwitch() {
  return (0, _hyperscript2.default)('.bindery-switch', (0, _hyperscript2.default)('.bindery-switch-handle'));
};

var switchRow = function switchRow() {
  for (var _len11 = arguments.length, arg = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
    arg[_key11] = arguments[_key11];
  }

  return _hyperscript2.default.apply(undefined, ['.bindery-toggle'].concat(arg, [toggleSwitch]));
};

exports.title = title;
exports.row = row;
exports.expandRow = expandRow;
exports.expandArea = expandArea;
exports.heading = heading;
exports.btn = btn;
exports.btnMain = btnMain;
exports.btnMini = btnMini;
exports.select = select;
exports.option = option;
exports.switchRow = switchRow;
exports.inputNumberUnits = inputNumberUnits;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(25);
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
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "@media screen {\n  .bindery-viewing .bindery-controls {\n    display: block !important;\n  }\n}\n\n.bindery-controls * {\n  font: inherit;\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\n.bindery-controls {\n  font: 14px / 1.4 -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  right: 0;\n  width: 240px;\n  z-index: 999;\n  margin: auto;\n  background: #f1f1f1;\n  /*outline: 1px solid rgba(0,0,0,0.05);*/\n  overflow: scroll;\n  padding-bottom: 100px;\n}\n\n.bindery-inProgress .bindery-controls {\n  pointer-events: none;\n}\n\n.bindery-status {\n  color: white;\n  padding: 6px 10px;\n}\n\n.bindery-btn {\n  -webkit-appearance: none;\n  padding: 8px 16px;\n  color: #444;\n  border: none;\n  background: rgba(0,0,0,0.06);\n  cursor: pointer;\n  font-size: 12px;\n  letter-spacing: 0.01em;\n  font-weight: 500;\n  display: inline-block;\n  border-radius: 3px;\n  margin: 16px;\n  width: auto;\n}\n\n.bindery-btn-main {\n  background: navy;\n  color: white;\n  /*border-color: black;*/\n}\n\n.bindery-btn:focus {\n  /*outline: 1px solid blue;*/\n  outline: none;\n}\n.bindery-btn:hover {\n  background: rgba(0,0,0,0.1);\n}\n.bindery-btn:active {\n  background: rgba(0,0,0,0.14);\n}\n.bindery-btn-main:hover {\n  background: navy;\n  opacity: 0.7;\n}\n.bindery-btn-main:active {\n  background: black;\n  opacity: 1;\n}\n\n.bindery-inProgress .bindery-btn {\n  opacity: 0.2;\n  pointer-events: none;\n}\n\n.bindery-heading {\n  font-size: 10px;\n  text-transform: uppercase;\n  color: #929292;\n  letter-spacing: 0.06em;\n  padding: 16px 20px;\n  box-shadow: inset 0 0.5px rgba(0,0,0,0.2);\n}\n\n.bindery-title {\n  padding: 20px;\n  font-size: 18px;\n}\n\n\n.bindery-viewswitcher {\n  padding: 12px 8px;\n  position: fixed;\n  bottom: 0;\n  right: 0;\n  /*background: white;*/\n  z-index: 99;\n  width: 240px;\n}\n.bindery-viewmode {\n  background-position: top center;\n  background-repeat: no-repeat;\n  height: 54px;\n  width: 25%;\n  display: inline-block;\n  text-align: center;\n  font-size: 10px;\n  color: #aaa;\n  cursor: pointer;\n  border-radius: 4px;\n}\n.bindery-viewmode .icon {\n  height: 32px;\n  width: 32px;\n  background: currentColor;\n  margin: 0 auto;\n}\n.bindery-viewmode:hover {\n  background: rgba(0,0,0,0.04);\n}\n.bindery-viewmode.selected {\n  color: navy;\n}\n\n.bindery-viewmode.grid .icon {\n  -webkit-mask: url(" + __webpack_require__(26) + ") no-repeat 50% 50%;\n}\n.bindery-viewmode.flip .icon {\n  -webkit-mask: url(" + __webpack_require__(27) + ") no-repeat 50% 50%;\n}\n.bindery-viewmode.outline .icon {\n  -webkit-mask: url(" + __webpack_require__(28) + ") no-repeat 50% 50%;\n}\n.bindery-viewmode.print .icon {\n  -webkit-mask: url(" + __webpack_require__(29) + ") no-repeat 50% 50%;\n}\n\n.bindery-toggle, .bindery-val, .bindery-expand-row {\n  position: relative;\n  display: block;\n  font-size: 14px;\n  padding: 8px 20px;\n  cursor: pointer;\n  margin-bottom: 4px;\n}\n.bindery-expand-row {\n  color: navy;\n}\n.bindery-expand-row::after {\n  content: '+';\n  font-size: 1.5em;\n  padding: 0 0;\n  position: absolute;\n  right: 20px;\n  top: 0;\n  font-weight: 300;\n}\n.bindery-expand-row.selected::after {\n  content: '\\2013';\n}\n\n.bindery-expand-row:hover {\n  background: rgba(0,0,0,0.04);\n}\n.bindery-expand-area {\n  display: none;\n  /*background: #f4f4f4;\n  box-shadow: inset 0 -0.5px 0 rgba(0,0,0,0.2);*/\n  margin-bottom: 16px;\n  padding: 12px 0;\n}\n.bindery-expand-row.selected {\n  /*background: #f4f4f4;\n  box-shadow: inset 0 0.5px 0 rgba(0,0,0,0.2);*/\n  margin-bottom: 0;\n}\n.bindery-expand-row.selected + .bindery-expand-area {\n  display: block;\n}\n\n.bindery-toggle select {\n  float: right;\n  border: none;\n  background: transparent;\n  padding: 12px;\n  width: 100px;\n}\n\n.bindery-toggle select:hover {\n  background: rgba(0,0,0,0.04);\n}\n\n.bindery-infopanel {\n  font-size: 14px;\n  margin-bottom: 8px;\n}\n\n.bindery-infopanel div {\n  padding: 8px 20px;\n}\n\n\n.bindery-val input {\n  width: 85px;\n  padding: 4px 6px 4px 8px;\n  text-align: right;\n  border: none;\n  background: none;\n  position: absolute;\n  top: 0;\n  right: 0;\n  height: 100%;\n  width: 100%;\n  text-shadow: 0 2px 0 white, 0 -2px 0 white, 2px 0 0 white, -2px 0 0 white;\n}\n\n.bindery-val input:invalid {\n    color: maroon;\n}\n\n.bindery-size div {\n  position: relative;\n  padding: 6px 6px 6px 14px;\n  color: #aaa;\n}\n\n.bindery-size::before, .bindery-size::after {\n  /*content: \"\";*/\n  display: block;\n  position: absolute;\n  background: #a9a9ff;\n}\n.bindery-size::before {\n  top: 0;\n  left: 6px;\n  bottom: 0;\n  width: 1px;\n}\n.bindery-size::after {\n  top: 6px;\n  left: 0;\n  right: 0;\n  height: 1px;\n}\n\n.bindery-size input {\n}\n\n.bindery-size, .bindery-margin {\n  display: inline-block;\n  vertical-align: middle;\n  margin: 0;\n  min-height: 80px;\n  background: white;\n  outline: 1px solid #ddd;\n  height: 100px;\n  width: 100px;\n}\n\n.bindery-size {\n  padding: 8px 0;\n  font-size: 12px;\n}\n\n.not-facing .bindery-size {\n  margin-right: 20px;\n  box-shadow: none;\n}\n.not-facing .bindery-margin {\n  box-shadow: none;\n}\n\n.bindery-layout-control {\n    margin: 4px 20px 16px;\n}\n\n\n.bindery-margin {\n  overflow: hidden;\n}\n.bindery-margin .preview {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  border: 1px solid #a9a9ff;\n  height: auto;\n  width: auto;\n  z-index: 0;\n  pointer-events: none;\n  transition: border 0.2s;\n}\n\n.bindery-margin input {\n  text-align: center;\n  padding: 4px;\n  /*margin-right: -5px;*/\n  font-size: 12px;\n}\n.bindery-margin input:focus {\n  /*text-decoration: underline;*/\n  background: none !important;\n}\n\n.bindery-margin > div  {\n  position: absolute;\n  width: 54px;\n  height: 24px;\n  z-index: 5;\n  /*background: white;*/\n}\n.bindery-margin > div:hover {\n  z-index: 99;\n}\n\n.bindery-margin .top {\n  left: 0;\n  right: 0;\n  margin: auto;\n  top: 0;\n}\n.bindery-margin .bottom {\n  left: 0;\n  right: 0;\n  margin: auto;\n  bottom: 0;\n}\n.bindery-margin .inner {\n  left: 0;\n  text-align: left;\n  top: calc(50% - 12px);\n}\n.bindery-margin .inner input {\n  text-align: left;\n}\n\n.bindery-margin .outer {\n  right: 0;\n  text-align: right;\n  top: calc(50% - 12px);\n}\n.bindery-margin .outer input {\n  text-align: right;\n}\n\n\n.bindery-val input:focus {\n    outline: none;\n    background: rgba(0,0,0,0.04);\n}\n\n.bindery-switch {\n  width: 28px;\n  height: 16px;\n  background: rgba(0,0,0,0.2);\n  border-radius: 8px;\n  margin-right: 5px;\n  vertical-align: middle;\n  float: right;\n  font-size: 8px;\n  transition: all 0.2s;\n  position: relative;\n}\n.bindery-switch-handle {\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background: white;\n  box-shadow: 0 1px 2px rgba(0,0,0,0.2);\n  transition: all 0.2s;\n  position: absolute;\n  left: 0px;\n  top: 0px;\n}\n.bindery-toggle:hover .bindery-switch-handle {\n  box-shadow: 0 2px 3px rgba(0,0,0,0.3);\n}\n\n.bindery-toggle.selected .bindery-switch {\n  background: rgba(0, 0, 128, 0.42);\n}\n.bindery-toggle.selected .bindery-switch-handle {\n  background: navy;\n  left: 12px;\n}\n", ""]);

// exports


/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000000' fill='none' fill-rule='evenodd'%3E%3Cpath d='M.5.5H11.5V15.5H.5zM11.5.5H22.5V15.5H11.5z' transform='translate(5 8)'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000000' fill='none' fill-rule='evenodd'%3E%3Cpath d='M0.5 0.5H11.5V15.5H0.5z' transform='translate(5 8)'/%3E%3Cpath d='M22.5,15.5 L22.5,0.5' stroke-linecap='square' transform='translate(5 8)'/%3E%3Cpath d='M16.5,8.5 L16.5,23.5 L16.9093327,23.5 L24.5,20.6534998 L24.5,5.72150023 L17.1755617,8.46816459 L17,8.5 L16.5,8.5 Z'/%3E%3Cpath d='M27.5 23.5L16.5 23.5M24.5 8.5L27.5 8.5' stroke-linecap='square'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23000000'%3E%3Cpath d='M.5.5H11.5V15.5H.5zM11.5.5H22.5V15.5H11.5z' transform='translate(5 8)'/%3E%3C/g%3E%3Cpath stroke='%23000000' d='M8.5 13.5H13.5V20.5H8.5z'/%3E%3Cpath fill='%23000000' d='M8 11H14V12H8z'/%3E%3Cpath stroke='%23000000' d='M19.5 13.5H24.5V20.5H19.5z'/%3E%3Cpath fill='%23000000' d='M19 11H25V12H19z'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000000' fill='none' fill-rule='evenodd'%3E%3Cpath d='M4.5 5.5H28.5V24.5H4.5z'/%3E%3Cpath d='M7.5 8.5L9.5 8.5M14.5 8.5L16.5 8.5M14.5 21.5L16.5 21.5M16.5 8.5L18.5 8.5M16.5 21.5L18.5 21.5M23.5 8.5L25.5 8.5M23.5 21.5L25.5 21.5M7.5 21.5L9.5 21.5M7.5 8.5L7.5 10.5M25.5 8.5L25.5 10.5M16.5 8.5L16.5 10.5M7.5 19.5L7.5 21.5M25.5 19.5L25.5 21.5M16.5 19.5L16.5 21.5' stroke-linecap='square'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PageBreak = __webpack_require__(31);

var _PageBreak2 = _interopRequireDefault(_PageBreak);

var _FullPage = __webpack_require__(32);

var _FullPage2 = _interopRequireDefault(_FullPage);

var _Spread = __webpack_require__(33);

var _Spread2 = _interopRequireDefault(_Spread);

var _Footnote = __webpack_require__(36);

var _Footnote2 = _interopRequireDefault(_Footnote);

var _PageReference = __webpack_require__(37);

var _PageReference2 = _interopRequireDefault(_PageReference);

var _RunningHeader = __webpack_require__(38);

var _RunningHeader2 = _interopRequireDefault(_RunningHeader);

var _BinderyRule = __webpack_require__(1);

var _BinderyRule2 = _interopRequireDefault(_BinderyRule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Spread: _Spread2.default,
  FullPage: _FullPage2.default,
  Footnote: _Footnote2.default,
  PageBreak: _PageBreak2.default,
  RunningHeader: _RunningHeader2.default,
  PageReference: _PageReference2.default,
  BinderyRule: _BinderyRule2.default,
  createRule: function createRule(options) {
    return new _BinderyRule2.default(options);
  }
};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new PageBreak(userOptions);
};

var _BinderyRule2 = __webpack_require__(1);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// API:
// position: 'before' (default) | 'after' | 'both'
// continue: | 'any' (default) | 'left' | 'right'

var PageBreak = function (_BinderyRule) {
  _inherits(PageBreak, _BinderyRule);

  function PageBreak(options) {
    _classCallCheck(this, PageBreak);

    options.name = 'Page Break';
    options.position = options.position ? options.position : 'before';
    options.continue = options.continue ? options.continue : 'any';
    return _possibleConstructorReturn(this, (PageBreak.__proto__ || Object.getPrototypeOf(PageBreak)).call(this, options));
  }

  _createClass(PageBreak, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt, state, requestNewPage) {
      if (this.position === 'before' || this.position === 'both') {
        if (!state.currentPage.isEmpty) {
          requestNewPage();
        }
        if (this.continue !== 'any') {
          state.currentPage.setPreference(this.continue);
        }
      }
      return elmt;
    }
  }, {
    key: 'afterAdd',
    value: function afterAdd(elmt, state, requestNewPage) {
      if (this.position === 'after' || this.position === 'both') {
        var newPage = requestNewPage();
        if (this.continue !== 'any') {
          newPage.setPreference(this.continue);
        }
      }
      return elmt;
    }
  }]);

  return PageBreak;
}(_BinderyRule3.default);

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new FullPage(userOptions);
};

var _BinderyRule2 = __webpack_require__(1);

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

      return elmt;
    }
  }, {
    key: 'afterAdd',
    value: function afterAdd(elmt, state) {
      state.currentPage = prevPage;
      state.path = prevElementPath;
      return elmt;
    }
  }]);

  return FullPage;
}(_BinderyRule3.default);

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new Spread(userOptions);
};

var _BinderyRule2 = __webpack_require__(1);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

__webpack_require__(34);

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
      return elmt;
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

      return elmt;
    }
  }]);

  return Spread;
}(_BinderyRule3.default);

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(35);
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
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, ".bindery-spread.bindery-left .bindery-content {\n  /*width: 200%;*/\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: -100%;\n  bottom: 0;\n}\n.bindery-spread.bindery-right .bindery-content {\n  position: absolute;\n  top: 0;\n  left: -100%;\n  right: 0;\n  bottom: 0;\n}\n", ""]);

// exports


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new Footnote(userOptions);
};

var _hyperscript = __webpack_require__(0);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _BinderyRule2 = __webpack_require__(1);

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
    value: function afterAdd(element, state, requestNewPage, overflowCallback) {
      var number = state.currentPage.footer.querySelectorAll('.footnote').length + 1;

      var parent = element.parentNode;
      var defensiveClone = element.cloneNode(true);
      var replacement = this.replace(defensiveClone, number);
      parent.replaceChild(replacement, element);

      var footnote = (0, _hyperscript2.default)('.footnote');
      var contents = this.render(element, number);
      if (contents instanceof HTMLElement) footnote.appendChild(contents);else if (typeof contents === 'string') footnote.innerHTML = contents;else footnote.textContent = '<sup>' + number + '</sup> Error: You must return an HTML Element or string from render';

      state.currentPage.footer.appendChild(footnote);

      if (state.currentPage.hasOverflowed()) {
        state.currentPage.footer.removeChild(footnote);
        parent.replaceChild(element, replacement);

        overflowCallback();
        return element;
      }

      return replacement;
    }
  }, {
    key: 'replace',
    value: function replace(element, number) {
      element.insertAdjacentHTML('beforeEnd', '<sup class="bindery-sup">' + number + '</sup>');
      return element;
    }
  }, {
    key: 'render',
    value: function render(element, number) {
      return '<sup>' + number + '</sup> Default footnote (<a href=\'http://evanbrooks.info/bindery/#docs\'>Docs</a>)';
    }
  }]);

  return Footnote;
}(_BinderyRule3.default);

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (options) {
  return new PageReference(options);
};

var _BinderyRule2 = __webpack_require__(1);

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
      var ref = elmt.getAttribute('href');
      elmt.setAttribute('data-page-reference', ref);
      this.references[ref] = elmt;
      return elmt;
    }
  }, {
    key: 'afterBind',
    value: function afterBind(page) {
      var _this2 = this;

      Object.keys(this.references).forEach(function (ref) {
        if (page.element.querySelector(ref)) {
          var original = _this2.references[ref];
          var parent = original.parentNode;
          var newEl = _this2.replace(original, page.number);
          parent.replaceChild(newEl, original);
        }
      });
    }
  }, {
    key: 'replace',
    value: function replace(original, number) {
      // original.removeAttribute('href');
      original.insertAdjacentHTML('beforeend', ' \u219D Page ' + number);
      return original;
    }
  }]);

  return PageReference;
}(_BinderyRule3.default);

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (userOptions) {
  return new RunningHeader(userOptions);
};

var _hyperscript = __webpack_require__(0);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _BinderyRule2 = __webpack_require__(1);

var _BinderyRule3 = _interopRequireDefault(_BinderyRule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

__webpack_require__(39);

var RunningHeader = function (_BinderyRule) {
  _inherits(RunningHeader, _BinderyRule);

  function RunningHeader(options) {
    _classCallCheck(this, RunningHeader);

    options.name = 'Running Header';
    if (options.beginSection) {
      options.selector = options.beginSection;
    }

    var _this = _possibleConstructorReturn(this, (RunningHeader.__proto__ || Object.getPrototypeOf(RunningHeader)).call(this, options));

    _this.customClass = options.customClass;
    _this.currentHeaderContent = '';
    return _this;
  }

  _createClass(RunningHeader, [{
    key: 'afterAdd',
    value: function afterAdd(elmt, state) {
      state.currentPage.section = elmt.textContent;
      return elmt;
    }
  }, {
    key: 'afterBind',
    value: function afterBind(page) {
      if (page.section) {
        this.currentHeaderContent = page.section;
      }
      page.section = this.currentHeaderContent;

      var el = (0, _hyperscript2.default)('.bindery-running-header');
      el.innerHTML = this.render(page);
      page.element.appendChild(el);
    }
  }, {
    key: 'render',
    value: function render(page) {
      return page.number;
    }
  }]);

  return RunningHeader;
}(_BinderyRule3.default);

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(40);
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
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, ".bindery-sup {\n  font-size: 0.667em;\n}\n\n.bindery-num, .bindery-running-header, .bindery-footer {\n  font-size: 10pt;\n}\n\n.bindery-num, .bindery-running-header {\n  position: absolute;\n  text-align: center;\n  top: 0.25in;\n}\n\n.bindery-left .bindery-running-header {\n  left: 18pt;\n  text-align: left;\n}\n\n.bindery-right .bindery-running-header {\n  right: 18pt;\n  text-align: right;\n}\n", ""]);

// exports


/***/ })
/******/ ]);
//# sourceMappingURL=bindery.js.map 