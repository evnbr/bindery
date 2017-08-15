// [AIV]  Build version: 2.0.0-alpha.4.1 - Monday, August 14th, 2017, 10:31:06 PM  
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
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// const p = 'bindery-';
var p = '📖-';

var prefix = function prefix(str) {
  return '' + p + str;
};
var prefixClass = function prefixClass(str) {
  return '.' + prefix(str);
};

var c = function c(str) {
  if (str[0] === '.') {
    return prefixClass(str.substr(1));
  }
  return prefix(str);
};

exports.default = c;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var split = __webpack_require__(12)
var ClassList = __webpack_require__(13)

var w = typeof window === 'undefined' ? __webpack_require__(15) : window
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
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var RuleOption = {
  enum: function _enum() {
    for (var _len = arguments.length, enumCases = Array(_len), _key = 0; _key < _len; _key++) {
      enumCases[_key] = arguments[_key];
    }

    return function (str) {
      return enumCases.includes(str);
    };
  },
  string: function string(val) {
    return typeof val === 'string';
  },
  bool: function bool(val) {
    return typeof val === 'boolean';
  },
  func: function func(val) {
    return typeof val === 'function';
  }
};

exports.default = RuleOption;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rule = function () {
  function Rule(options) {
    var _this = this;

    _classCallCheck(this, Rule);

    this.name = options.name ? options.name : 'Unnamed Bindery Rule';
    this.selector = '';

    Object.keys(options).forEach(function (key) {
      _this[key] = options[key];
    });
  }

  _createClass(Rule, [{
    key: 'validate',
    value: function validate(opts, validOpts) {
      var _this2 = this;

      Object.keys(opts).forEach(function (k) {
        if (!validOpts[k]) {
          console.error('Bindery: Rule \'' + _this2.name + '\' doesn\'t have an option \'' + k + '\'');
        } else {
          var val = opts[k];
          if (!validOpts[k](val)) {
            console.error('Bindery: In Rule \'' + _this2.name + '\', \'' + val + '\' is not a valid value for \'' + k + '\'');
          }
        }
      });
    }
  }]);

  return Rule;
}();

exports.default = Rule;

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

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Page = function () {
  function Page() {
    _classCallCheck(this, Page);

    this.flowContent = (0, _hyperscript2.default)((0, _prefixClass2.default)('.content'));
    this.flowBox = (0, _hyperscript2.default)((0, _prefixClass2.default)('.flowbox'), this.flowContent);
    this.footer = (0, _hyperscript2.default)((0, _prefixClass2.default)('.footer'));
    this.background = (0, _hyperscript2.default)((0, _prefixClass2.default)('.background'));
    this.element = (0, _hyperscript2.default)((0, _prefixClass2.default)('.page') + (0, _prefixClass2.default)('.page-size'), this.background, this.flowBox, this.footer);
  }

  _createClass(Page, [{
    key: 'overflowAmount',
    value: function overflowAmount() {
      var contentH = this.flowContent.offsetHeight;
      var boxH = this.flowBox.offsetHeight;

      if (boxH === 0) {
        throw Error('Bindery: Trying to flow into a box of zero height.');
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
        this.element.classList.remove((0, _prefixClass2.default)('right'));
        this.element.classList.add((0, _prefixClass2.default)('left'));
      } else if (dir === 'right') {
        this.side = dir;
        this.element.classList.remove((0, _prefixClass2.default)('left'));
        this.element.classList.add((0, _prefixClass2.default)('right'));
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
    key: 'suppressErrors',
    get: function get() {
      return this.suppress || false;
    },
    set: function set(newVal) {
      this.suppress = newVal;
      if (newVal) {
        this.element.classList.add((0, _prefixClass2.default)('is-overflowing'));
      } else {
        this.element.classList.remove((0, _prefixClass2.default)('is-overflowing'));
      }
    }
  }, {
    key: 'isEmpty',
    get: function get() {
      return this.flowContent.textContent.trim() === '' && this.flowBox.offsetHeight < 1;
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
      document.body.classList.remove((0, _prefixClass2.default)('viewing'));

      var testPage = new Page();
      var measureArea = document.querySelector((0, _prefixClass2.default)('.measure-area'));
      if (!measureArea) measureArea = document.body.appendChild((0, _hyperscript2.default)((0, _prefixClass2.default)('.measure-area')));

      measureArea.innerHTML = '';
      measureArea.appendChild(testPage.element);
      var box = testPage.flowBox.getBoundingClientRect();

      measureArea.parentNode.removeChild(measureArea);

      return box.height > 100 && box.width > 100; // TODO: Number is arbitrary
    }
  }]);

  return Page;
}();

exports.default = Page;

/***/ }),
/* 5 */
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
var cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;
var cssNumberPattern = '^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$';

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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Rule2 = __webpack_require__(3);

var _Rule3 = _interopRequireDefault(_Rule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Options:
// selector: String
// replace: function (HTMLElement) => HTMLElement

var Replace = function (_Rule) {
  _inherits(Replace, _Rule);

  function Replace(options) {
    _classCallCheck(this, Replace);

    var _this = _possibleConstructorReturn(this, (Replace.__proto__ || Object.getPrototypeOf(Replace)).call(this, options));

    _this.name = 'Replace';
    return _this;
  }

  _createClass(Replace, [{
    key: 'afterAdd',
    value: function afterAdd(element, state, requestNewPage, overflowCallback) {
      var parent = element.parentNode;
      if (!parent) {
        throw Error('Bindery: Rule assumes element has been added but it has no parent.', element);
      }
      var defensiveClone = element.cloneNode(true);
      var replacement = this.createReplacement(state, defensiveClone);
      parent.replaceChild(replacement, element);

      if (state.currentPage.hasOverflowed()) {
        parent.replaceChild(element, replacement);

        return overflowCallback(element);
      }

      return replacement;
    }
  }, {
    key: 'createReplacement',
    value: function createReplacement(state, element) {
      return this.replace(element);
    }
  }, {
    key: 'replace',
    value: function replace(element) {
      element.insertAdjacentHTML('beforeEnd', '<sup class="bindery-sup">Default Replacement</sup>');
      return element;
    }
  }]);

  return Replace;
}(_Rule3.default);

exports.default = Replace;

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
    text = '("' + node.textContent.substr(0, 30).replace(/\s+/g, ' ') + '...")';
  }
  return tag + id + classes + text;
};

exports.default = elementToString;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.last = exports.arraysEqual = undefined;

var _arraysEqual = __webpack_require__(17);

var _arraysEqual2 = _interopRequireDefault(_arraysEqual);

var _arrayLast = __webpack_require__(18);

var _arrayLast2 = _interopRequireDefault(_arrayLast);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.arraysEqual = _arraysEqual2.default;
exports.last = _arrayLast2.default;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _Rule2 = __webpack_require__(3);

var _Rule3 = _interopRequireDefault(_Rule2);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

var _elementToString = __webpack_require__(7);

var _elementToString2 = _interopRequireDefault(_elementToString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OutOfFlow = function (_Rule) {
  _inherits(OutOfFlow, _Rule);

  function OutOfFlow(options) {
    _classCallCheck(this, OutOfFlow);

    var _this = _possibleConstructorReturn(this, (OutOfFlow.__proto__ || Object.getPrototypeOf(OutOfFlow)).call(this, options));

    _this.name = 'Out of Flow';
    return _this;
  }

  _createClass(OutOfFlow, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt, state, continueOnNewPage, makeNewPage) {
      var placeholder = (0, _hyperscript2.default)((0, _prefixClass2.default)('.out-of-flow'));
      placeholder.setAttribute('data-bindery', '' + (0, _elementToString2.default)(elmt));
      // placeholder.textContent = '[Bindery: Element moved out of flow]';

      this.addElementOutOfFlow(elmt, state, makeNewPage);

      if (this.continue !== 'same') {
        continueOnNewPage();
        if (this.continue === 'left' || this.continue === 'right') {
          state.currentPage.setPreference(this.continue);
        }
      }

      return placeholder;
    }
  }]);

  return OutOfFlow;
}(_Rule3.default);

exports.default = OutOfFlow;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _paginate = __webpack_require__(11);

var _paginate2 = _interopRequireDefault(_paginate);

var _Styler = __webpack_require__(24);

var _Styler2 = _interopRequireDefault(_Styler);

var _Viewer = __webpack_require__(25);

var _Viewer2 = _interopRequireDefault(_Viewer);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

var _utils = __webpack_require__(8);

var _Rules = __webpack_require__(34);

var _Rules2 = _interopRequireDefault(_Rules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(42);

var DEFAULT_PAGE_SIZE = { width: '288pt', height: '432pt' };
var DEFAULT_PAGE_MARGIN = {
  inner: '24pt',
  outer: '32pt',
  bottom: '54pt',
  top: '48pt'
};

var Bindery = function () {
  function Bindery(opts) {
    _classCallCheck(this, Bindery);

    console.log('Bindery ' + '2.0.0-alpha.4.1');

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;
    this.debug = opts.debug || false;

    this.styler = new _Styler2.default();
    this.styler.setSize(opts.pageSize || DEFAULT_PAGE_SIZE);
    this.styler.setMargin(opts.pageMargin || DEFAULT_PAGE_MARGIN);
    this.styler.setBleed('0.2in');

    this.viewer = new _Viewer2.default({ bindery: this });
    this.controls = this.viewer.controls;

    if (opts.startingView) {
      this.viewer.setMode(opts.startingView);
    }

    this.rules = [];
    if (opts.rules) this.addRules(opts.rules);

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
      if (this.autorun) {
        this.makeBook();
      }
    } else if (_typeof(opts.source) === 'object' && opts.source.url) {
      var url = opts.source.url;
      var selector = opts.source.selector;
      this.fetchSource(url, selector);
    } else if (opts.source instanceof HTMLElement) {
      this.source = opts.source;
      if (this.autorun) {
        this.makeBook();
      }
    } else {
      console.error('Bindery: Source must be an element or selector');
    }
  }

  // Convenience constructor


  _createClass(Bindery, [{
    key: 'fetchSource',
    value: function fetchSource(url, selector) {
      var _this = this;

      fetch(url).then(function (response) {
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
        if (_this.autorun) {
          _this.makeBook();
        }
      }).catch(function (error) {
        console.error(error);
        var scheme = window.location.href.split('://')[0];
        if (scheme === 'file') {
          _this.viewer.displayError('Can\'t fetch content from "' + url + '"', 'Web pages can\'t fetch content unless they are on a server.');
        }
      });
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.stopCheckingLayout();
      this.viewer.cancel();
      document.body.classList.remove((0, _prefixClass2.default)('viewing'));
      this.source.style.display = '';
    }
  }, {
    key: 'addRules',
    value: function addRules(newRules) {
      var _this2 = this;

      newRules.forEach(function (rule) {
        if (rule instanceof _Rules2.default.Rule) {
          _this2.rules.push(rule);
        } else {
          throw Error('Bindery: The following is not an instance of Bindery.Rule and will be ignored: ' + rule);
        }
      });
    }
  }, {
    key: 'makeBook',
    value: function makeBook(doneBinding) {
      var _this3 = this;

      if (!this.source) {
        document.body.classList.add((0, _prefixClass2.default)('viewing'));
        return;
      }

      if (!this.styler.isSizeValid()) {
        this.viewer.displayError('Page is too small', 'Size: ' + JSON.stringify(this.pageSize) + ' \n Margin: ' + JSON.stringify(this.pageMargin) + ' \n Try adjusting the sizes or units.');
        console.error('Bindery: Cancelled pagination. Page is too small.');
        return;
      }

      this.stopCheckingLayout();

      this.source.style.display = '';
      var content = this.source.cloneNode(true);
      this.source.style.display = 'none';

      // In case we're updating an existing layout
      this.viewer.clear();
      document.body.classList.add((0, _prefixClass2.default)('viewing'));
      this.viewer.element.classList.add((0, _prefixClass2.default)('in-progress'));
      if (this.debug) document.body.classList.add((0, _prefixClass2.default)('debug'));

      this.styler.updateStylesheet();

      this.controls.setInProgress();

      (0, _paginate2.default)({
        content: content,
        rules: this.rules,
        success: function success(book) {
          setTimeout(function () {
            _this3.viewer.book = book;
            _this3.viewer.render();

            _this3.controls.setDone();
            if (doneBinding) doneBinding();
            _this3.viewer.element.classList.remove((0, _prefixClass2.default)('in-progress'));
            document.body.classList.remove((0, _prefixClass2.default)('debug'));
            _this3.startCheckingLayout();
          }, 100);
        },
        progress: function progress(pageCount) {
          _this3.controls.updateProgress(pageCount);
        },
        error: function error(_error) {
          document.body.classList.remove((0, _prefixClass2.default)('in-progress'));
          _this3.viewer.displayError('Layout couldn\'t complete', _error);
        },
        isDebugging: this.debug
      });
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
      if (!(0, _utils.arraysEqual)(newOverflows, this.pageOverflows)) {
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _elementToString = __webpack_require__(7);

var _elementToString2 = _interopRequireDefault(_elementToString);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

var _scrollElement = __webpack_require__(16);

var _utils = __webpack_require__(8);

var _Book = __webpack_require__(19);

var _Book2 = _interopRequireDefault(_Book);

var _Page = __webpack_require__(4);

var _Page2 = _interopRequireDefault(_Page);

var _Scheduler = __webpack_require__(20);

var _Scheduler2 = _interopRequireDefault(_Scheduler);

var _orderPages = __webpack_require__(21);

var _orderPages2 = _interopRequireDefault(_orderPages);

var _annotatePages = __webpack_require__(22);

var _annotatePages2 = _interopRequireDefault(_annotatePages);

var _breadcrumbCloner = __webpack_require__(23);

var _breadcrumbCloner2 = _interopRequireDefault(_breadcrumbCloner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Utils


// Bindery


// paginate


var MAXIMUM_PAGE_LIMIT = 9999;

var paginate = function paginate(_ref) {
  var content = _ref.content,
      rules = _ref.rules,
      success = _ref.success,
      progress = _ref.progress,
      error = _ref.error,
      isDebugging = _ref.isDebugging;

  // SETUP
  var start = window.performance.now();
  var state = {
    breadcrumb: [], // Stack representing which element we're currently inside
    pages: [],
    book: new _Book2.default()
  };
  var scheduler = new _Scheduler2.default(isDebugging);
  var measureArea = document.body.appendChild((0, _hyperscript2.default)((0, _prefixClass2.default)('.measure-area')));

  var cloneBreadcrumb = (0, _breadcrumbCloner2.default)(rules);

  var applyNewPageRules = function applyNewPageRules(pg) {
    rules.forEach(function (rule) {
      if (rule.afterPageCreated) rule.afterPageCreated(pg, state);
    });
  };

  var makeNewPage = function makeNewPage() {
    var newPage = new _Page2.default();
    var shouldScroll = isDebugging && (0, _scrollElement.scrollPct)(measureArea) > 0.9;
    measureArea.appendChild(newPage.element);
    if (shouldScroll) (0, _scrollElement.scrollToBottom)(measureArea);

    applyNewPageRules(newPage);
    return newPage;
  };

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  var continueOnNewPage = function continueOnNewPage() {
    if (state.currentPage && state.currentPage.hasOverflowed()) {
      console.warn('Bindery: Page overflowing', state.currentPage.element);
      if (!state.currentPage.suppressErrors) {
        throw Error('Bindery: Moved to new page when last one is still overflowing');
      }
    }

    if (state.pages.length === 500) {
      console.warn('Bindery: More than 500 pages, performance may be slow.');
    } else if (state.pages.length === 1000) {
      console.warn('Bindery: More than 1000 pages, performance may be slow.');
    } else if (state.pages.length > MAXIMUM_PAGE_LIMIT) {
      error('Maximum page count exceeded');
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }

    state.breadcrumb = cloneBreadcrumb(state.breadcrumb);
    var newPage = makeNewPage();
    state.pages.push(newPage);
    state.currentPage = newPage;
    if (state.breadcrumb[0]) {
      newPage.flowContent.appendChild(state.breadcrumb[0]);
    }

    // make sure the cloned page is valid.
    if (newPage.hasOverflowed()) {
      var suspect = (0, _utils.last)(state.breadcrumb);
      if (suspect) {
        console.error('Bindery: NextPage already overflowing, probably due to a style set on ' + (0, _elementToString2.default)(suspect) + '. It may not fit on the page.');
        suspect.parentNode.removeChild(suspect);
      } else {
        console.error('Bindery: NextPage already overflowing.');
      }
    }

    progress(state.pages.length);

    return newPage;
  };

  var beforeAddRules = rules.filter(function (r) {
    return r.selector && r.beforeAdd;
  });
  var applyBeforeAddRules = function applyBeforeAddRules(element) {
    var addedElement = element;
    beforeAddRules.forEach(function (rule) {
      if (addedElement.matches(rule.selector)) {
        addedElement = rule.beforeAdd(addedElement, state, continueOnNewPage, makeNewPage);
      }
    });
    return addedElement;
  };

  var afterAddRules = rules.filter(function (r) {
    return r.selector && r.afterAdd;
  });
  var applyAfterAddRules = function applyAfterAddRules(originalElement) {
    var addedElement = originalElement;
    afterAddRules.forEach(function (rule) {
      if (addedElement.matches(rule.selector)) {
        addedElement = rule.afterAdd(addedElement, state, continueOnNewPage, function overflowCallback(problemElement) {
          // TODO:
          // While this does catch overflows, it introduces a few new bugs.
          // It is pretty aggressive to move the entire node to the next page.
          // - 1. there is no guarentee it will fit on the new page
          // - 2. if it has childNodes, those side effects will not be undone,
          // which means footnotes will get left on previous page.
          // - 3. if it is a large paragraph, it will leave a large gap. the
          // ideal approach would be to only need to invalidate
          // the last line of text.
          problemElement.parentNode.removeChild(problemElement);
          continueOnNewPage();
          var lastEl = (0, _utils.last)(state.breadcrumb);
          lastEl.appendChild(problemElement);
          return rule.afterAdd(problemElement, state, continueOnNewPage, function () {
            console.log('Couldn\'t apply ' + rule.name + ' to ' + (0, _elementToString2.default)(problemElement) + '. Caused overflows twice.');
          });
        });
      }
    });
    return addedElement;
  };
  var afterBindRules = function afterBindRules(book) {
    rules.forEach(function (rule) {
      if (rule.afterBind) {
        book.pages.forEach(function (page) {
          rule.afterBind(page, book);
        });
      }
    });
  };

  // Walk up the tree to see if we can safely
  // insert a split into this node.
  var selectorsNotToSplit = rules.filter(function (rule) {
    return rule.avoidSplit;
  }).map(function (rule) {
    return rule.selector;
  });

  var isSplittable = function isSplittable(node) {
    if (selectorsNotToSplit.some(function (sel) {
      return node.matches(sel);
    })) {
      if (node.hasAttribute('data-bindery-did-move')) {
        return true; // don't split it again.
      }
      if (node.classList.contains((0, _prefixClass2.default)('continuation'))) {
        return true; // don't split it again.
      }
      return false;
    }
    if (node.parentElement) {
      return isSplittable(node.parentElement);
    }
    return true;
  };

  // TODO: Once a node is moved to a new page, it should
  // no longer trigger another move. otherwise tall elements
  // will trigger endlessly get shifted to the next page
  var moveNodeToNextPage = function moveNodeToNextPage(nodeToMove) {
    // So this node won't get cloned. TODO: this is unclear
    state.breadcrumb.pop();

    // find the nearest splittable parent
    var willMove = nodeToMove;
    var pathToRestore = [];
    while (!isSplittable((0, _utils.last)(state.breadcrumb))) {
      // console.log('Not OK to split:', last(state.breadcrumb));
      willMove = state.breadcrumb.pop();
      pathToRestore.unshift(willMove);
    }

    // console.log('OK to split:', last(state.breadcrumb));
    // console.log('Will move:', willMove);
    willMove.setAttribute('data-bindery-did-move', true);

    var parent = willMove.parentNode;
    // remove the unsplittable node and subnodes
    parent.removeChild(willMove);

    // TODO: step back even further if the
    // to avoid leaving otherwise empty nodes behind
    if ((0, _utils.last)(state.breadcrumb).textContent.trim() === '') {
      // console.log('Leaving empty node', last(state.breadcrumb));
      parent.appendChild(willMove);
      willMove = state.breadcrumb.pop();
      pathToRestore.unshift(willMove);
      willMove.parentNode.removeChild(willMove);
    }

    if (state.currentPage.isEmpty) {}
    // throw Error('moving from empty page');


    // create new page and clone context onto it
    continueOnNewPage();

    // append node as first in new page
    (0, _utils.last)(state.breadcrumb).appendChild(willMove);

    // restore subpath
    pathToRestore.forEach(function (restore) {
      state.breadcrumb.push(restore);
    });
    state.breadcrumb.push(nodeToMove);
  };

  var addTextNode = function addTextNode(textNode, doneCallback, undoAddTextNode) {
    (0, _utils.last)(state.breadcrumb).appendChild(textNode);

    if (state.currentPage.hasOverflowed()) {
      textNode.parentNode.removeChild(textNode);
      undoAddTextNode();
    } else {
      scheduler.throttle(doneCallback);
    }
  };

  // Adds an text node by incrementally adding words
  // until it just barely doesnt overflow
  var addTextNodeIncremental = function addTextNodeIncremental(originalNode, doneCallback, undoAddTextNode) {
    var originalText = originalNode.nodeValue;
    var textNode = originalNode;
    (0, _utils.last)(state.breadcrumb).appendChild(textNode);

    if (!state.currentPage.hasOverflowed()) {
      scheduler.throttle(doneCallback);
      return;
    }

    var pos = 0;

    var splitTextStep = function splitTextStep() {
      textNode.nodeValue = originalText.substr(0, pos);

      if (state.currentPage.hasOverflowed()) {
        // Back out to word boundary
        if (originalText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
        while (originalText.charAt(pos) !== ' ' && pos > 0) {
          pos -= 1;
        }if (pos < 1) {
          textNode.nodeValue = originalText;
          textNode.parentNode.removeChild(textNode);
          undoAddTextNode();
          return;
        }

        var fittingText = originalText.substr(0, pos);
        var overflowingText = originalText.substr(pos);
        textNode.nodeValue = fittingText;
        originalText = overflowingText;

        pos = 0;

        // Start on new page
        continueOnNewPage();

        // Continue working with clone
        textNode = document.createTextNode(originalText);
        (0, _utils.last)(state.breadcrumb).appendChild(textNode);

        // If the remainder fits there, we're done
        if (!state.currentPage.hasOverflowed()) {
          scheduler.throttle(doneCallback);
          return;
        }

        scheduler.throttle(splitTextStep);
        return;
      }
      if (pos > originalText.length - 1) {
        scheduler.throttle(doneCallback);
        return;
      }

      pos += 1;
      while (originalText.charAt(pos) !== ' ' && pos < originalText.length) {
        pos += 1;
      }scheduler.throttle(splitTextStep);
    };

    splitTextStep();
  };

  var addTextChild = function addTextChild(parent, child, next) {
    var forceAddTextNode = function forceAddTextNode() {
      (0, _utils.last)(state.breadcrumb).appendChild(child);
      state.currentPage.suppressErrors = true;
      continueOnNewPage();
      scheduler.throttle(next);
    };
    if (isSplittable(parent)) {
      var undoAddTextNode = function undoAddTextNode() {
        moveNodeToNextPage(parent);
        addTextNodeIncremental(child, next, forceAddTextNode);
      };
      addTextNodeIncremental(child, next, undoAddTextNode);
    } else {
      var _undoAddTextNode = function _undoAddTextNode() {
        moveNodeToNextPage(parent);
        addTextNode(child, next, forceAddTextNode);
      };
      addTextNode(child, next, _undoAddTextNode);
    }
  };

  var addElementChild = function addElementChild(parent, childToAdd, next) {
    var child = childToAdd;
    if (child.tagName === 'SCRIPT') {
      next(); // skips
      return;
    }

    if (child.tagName === 'IMG') {
      if (!child.complete) {
        console.log('Bindery: Waiting for image \'' + child.src + '\'');
        child.addEventListener('load', function () {
          console.log('Bindery: Image \'' + child.src + '\' loaded.');
          addElementChild(parent, child, next);
        });
        child.addEventListener('error', function () {
          console.error('Bindery: Image \'' + child.src + '\' failed to load.');
          addElementChild(parent, child, next);
        });
        child.src = child.src;
        return;
      }
    }

    child = applyBeforeAddRules(child);

    var addedChildrenSuccess = function addedChildrenSuccess() {
      // We're now done with this element and its children,
      // so we pop up a level
      var addedChild = state.breadcrumb.pop();

      // If this child didn't fit any contents on this page,
      // but did have contents on a previous page
      // we should never have added it.
      // TODO: Catch this earlier.
      // if (addedChild.classList.contains(c('continuation'))
      //   && addedChild.children.length === 0) {
      //   addedChild.parentNode.removeChild(addedChild);
      // } else {
      //   // TODO: AfterAdd rules may want to access original child, not split second half
      //   applyAfterAddRules(addedChild);
      // }
      applyAfterAddRules(addedChild);

      if (state.currentPage.hasOverflowed()) {
        // console.log('Bindery: Added element despite overflowing');
      }
      next();
    };

    scheduler.throttle(function () {
      addElementNode(child, addedChildrenSuccess);
    });
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  var addElementNode = function addElementNode(node, doneCallback) {
    if (state.currentPage.hasOverflowed()) {
      // console.error('Bindery: Trying to add node to a page that\'s already overflowing');
      state.currentPage.suppressErrors = true;
      continueOnNewPage();
    }

    // Add this node to the current page or context
    if (!state.breadcrumb[0]) state.currentPage.flowContent.appendChild(node);else (0, _utils.last)(state.breadcrumb).appendChild(node);

    state.breadcrumb.push(node);

    var childNodes = [].concat(_toConsumableArray(node.childNodes));
    node.innerHTML = '';

    // Overflows when empty
    if (state.currentPage.hasOverflowed()) {
      moveNodeToNextPage(node);
    }

    var index = 0;
    var addNext = function addNext() {
      if (!(index < childNodes.length)) {
        doneCallback();
        return;
      }
      var child = childNodes[index];
      index += 1;

      if (child.nodeType === Node.TEXT_NODE) {
        addTextChild(node, child, addNext);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        addElementChild(node, child, addNext);
      } else {
        addNext(); // Skip comments and unknown nodes
      }
    };
    // kick it off
    addNext();
  };

  var finishPagination = function finishPagination() {
    document.body.removeChild(measureArea);

    var orderedPages = (0, _orderPages2.default)(state.pages, makeNewPage);
    (0, _annotatePages2.default)(orderedPages);

    state.book.pages = orderedPages;
    state.book.setCompleted();

    afterBindRules(state.book);

    var end = window.performance.now();
    if (!isDebugging) {
      console.log('Bindery: Pages created in ' + (end - start) / 1000 + 's');
    }

    success(state.book);
  };

  content.style.margin = 0;
  content.style.padding = 0;
  continueOnNewPage();
  addElementNode(content, finishPagination);
};

exports.default = paginate;

/***/ }),
/* 12 */
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// contains, add, remove, toggle
var indexof = __webpack_require__(14)

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
/* 14 */
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
/* 15 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

// eslint-disable-next-line no-confusing-arrow
var easeInOutQuad = function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

var scrollPct = function scrollPct(el) {
  return (el.scrollTop + el.offsetHeight) / el.scrollHeight;
};

var scrollToBottom = function scrollToBottom(el) {
  var start = el.scrollTop;
  var end = el.scrollHeight;
  var dist = end - start;
  var t = 0;
  var step = function step() {
    el.scrollTop = start + easeInOutQuad(t) * dist;
    t += 0.05;
    if (t < 1) requestAnimationFrame(step);
  };
  step();
};

exports.scrollToBottom = scrollToBottom;
exports.scrollPct = scrollPct;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
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

exports.default = arraysEqual;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var last = function last(arr) {
  return arr[arr.length - 1];
};

exports.default = last;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Book = function () {
  function Book() {
    _classCallCheck(this, Book);

    this.pages = [];
    this.queued = [];
    this.isComplete = false;
  }

  _createClass(Book, [{
    key: "pagesForSelector",


    // arguments: selector : String
    // return: pages : [ Int ]
    // if no matches: []
    value: function pagesForSelector(sel) {
      return this.pagesForTest(function (page) {
        return page.element.querySelector(sel);
      });
    }
    // arguments: testFunc : (element) => bool
    // return: pages : [ Int ]
    // if no matches: []

  }, {
    key: "pagesForTest",
    value: function pagesForTest(testFunc) {
      return this.pages.filter(function (pg) {
        return testFunc(pg.element);
      }).map(function (pg) {
        return pg.number;
      });
    }
  }, {
    key: "onComplete",
    value: function onComplete(func) {
      if (!this.isComplete) this.queued.push(func);else func();
    }
  }, {
    key: "setCompleted",
    value: function setCompleted() {
      this.isComplete = true;
      this.queued.forEach(function (func) {
        func();
      });
    }
  }, {
    key: "pageCount",
    get: function get() {
      return this.pages.length;
    }
  }]);

  return Book;
}();

exports.default = Book;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Even when there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent the call stack from getting too big.
//
// There might be a better way to do this.
var MAX_CALLS = 500;

var Scheduler = function () {
  function Scheduler(debuggable) {
    _classCallCheck(this, Scheduler);

    this.numberOfCalls = 0;
    this.resumeLimit = Infinity;
    this.callsSinceResume = 0;
    this.queuedFunc = null;
    this.isPaused = false;
    this.useDelay = debuggable;
    this.delayTime = 100;

    if (debuggable) {
      // Only expose these
      window.binderyDebug = {
        pause: this.pause.bind(this),
        resume: this.resume.bind(this),
        resumeFor: this.resumeFor.bind(this),
        step: this.step.bind(this),
        finish: this.finish.bind(this)
      };
      console.log('Bindery: Debug layout with the following: \nbinderyDebug.pause() \nbinderyDebug.resume()\n binderyDebug.resumeFor(n) // pauses after n steps, \nbinderyDebug.step()');
    }
  }

  _createClass(Scheduler, [{
    key: 'throttle',
    value: function throttle(func) {
      this.callsSinceResume += 1;

      if (this.callsSinceResume > this.resumeLimit) {
        this.endResume();
      }

      if (this.isPaused) {
        this.queuedFunc = func;
      } else if (this.useDelay) {
        setTimeout(func, this.delayTime);
      } else if (this.numberOfCalls < MAX_CALLS) {
        this.numberOfCalls += 1;
        func();
      } else {
        this.numberOfCalls = 0;
        requestAnimationFrame(func);
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (this.isPaused) return 'Already paused';
      this.isPaused = true;
      return 'Paused';
    }
  }, {
    key: 'resumeDelay',
    value: function resumeDelay() {
      this.useDelay = true;
      this.resume();
    }
  }, {
    key: 'finish',
    value: function finish() {
      this.useDelay = false;
      this.resume();
    }
  }, {
    key: 'resume',
    value: function resume() {
      if (this.isPaused) {
        this.isPaused = false;
        if (this.queuedFunc) {
          this.queuedFunc();
          this.queuedFunc = null;
        } else {
          return 'Layout complete';
        }
        return 'Resuming';
      }
      return 'Already running';
    }
  }, {
    key: 'step',
    value: function step() {
      if (!this.isPaused) {
        return this.pause();
      }
      if (this.queuedFunc) {
        var queued = this.queuedFunc;
        var n = queued.name;
        this.queuedFunc = null;
        queued();
        return n;
      }
      return 'Layout complete';
    }
  }, {
    key: 'resumeFor',
    value: function resumeFor(n) {
      this.callsSinceResume = 0;
      this.resumeLimit = n;
      return this.resume();
    }
  }, {
    key: 'endResume',
    value: function endResume() {
      console.log('Paused after ' + this.resumeLimit);
      this.resumeLimit = Infinity;
      this.callsSinceResume = 0;
      this.pause();
    }
  }]);

  return Scheduler;
}();

exports.default = Scheduler;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var indexOfNextInFlowPage = function indexOfNextInFlowPage(pages, startIndex) {
  for (var i = startIndex; i < pages.length; i += 1) {
    if (!pages[i].isOutOfFlow) {
      return i;
    }
  }
  return startIndex;
};

var orderPages = function orderPages(pages, makeNewPage) {
  var orderedPages = pages.slice();

  for (var i = 0; i < orderedPages.length; i += 1) {
    var page = orderedPages[i];
    var isLeft = i % 2 !== 0;

    if (isLeft && page.alwaysRight) {
      if (page.isOutOfFlow) {
        var indexToSwap = indexOfNextInFlowPage(orderedPages, i + 1);
        var pageToMoveUp = orderedPages[indexToSwap];
        orderedPages.splice(indexToSwap, 1);
        orderedPages.splice(i, 0, pageToMoveUp);
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    } else if (!isLeft && page.alwaysLeft) {
      if (page.isOutOfFlow) {
        var _indexToSwap = indexOfNextInFlowPage(orderedPages, i + 1);
        var _pageToMoveUp = orderedPages[_indexToSwap];
        orderedPages.splice(_indexToSwap, 1);
        orderedPages.splice(i, 0, _pageToMoveUp);
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    }
  }
  return orderedPages;
};

exports.default = orderPages;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var annotatePages = function annotatePages(pages) {
  // ———
  // NUMBERING

  // TODO: Pass in facingpages options
  var facingPages = true;
  if (facingPages) {
    pages.forEach(function (page, i) {
      page.number = i + 1;
      page.setLeftRight(i % 2 === 0 ? 'right' : 'left');
    });
  } else {
    pages.forEach(function (page) {
      page.setLeftRight('right');
    });
  }

  // ———
  // RUNNING HEADERS

  // Sections to annotate with.
  // This should be a hierarchical list of selectors.
  // Every time one is selected, it annotates all following pages
  // and clears any subselectors.
  // TODO: Make this configurable
  var running = { h1: '', h2: '', h3: '', h4: '', h5: '', h6: '' };

  pages.forEach(function (page) {
    page.heading = {};
    Object.keys(running).forEach(function (tagName, i) {
      var element = page.element.querySelector(tagName);
      if (element) {
        running[tagName] = element.textContent;
        // clear remainder
        Object.keys(running).forEach(function (tag, j) {
          if (j > i) running[tag] = '';
        });
      }
      if (running[tagName] !== '') {
        page.heading[tagName] = running[tagName];
      }
    });
  });
};

exports.default = annotatePages;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @param rules: array of Bindery.Rules
// @return: A new function that clones the given
// breadcrumb according to those rules. (original : Array) => clone : Array
//
// The breadcrumb is an array of nested elments,
// for example .content > article > p > a).
//
// It's shallowly cloned every time we move to the next page,
// to create the illusion that nodes are continuing from page
// to page.
//
// The transition can be customized by setting a Continuation rule,
// which lets you add classes to the original and cloned element
// to customize styling.

var breadcrumbCloner = function breadcrumbCloner(rules) {
  // METHODS
  var markAsContinues = function markAsContinues(node) {
    node.classList.add((0, _prefixClass2.default)('continues'));
    rules.filter(function (rule) {
      return rule.customContinuesClass;
    }).forEach(function (rule) {
      return node.classList.add(rule.customContinuesClass);
    });
  };

  var markAsContinuation = function markAsContinuation(node) {
    node.classList.add((0, _prefixClass2.default)('continuation'));
    rules.filter(function (rule) {
      return rule.customContinuationClass;
    }).forEach(function (rule) {
      return node.classList.add(rule.customContinuationClass);
    });
  };

  return function (origBreadcrumb) {
    var newBreadcrumb = [];

    for (var i = origBreadcrumb.length - 1; i >= 0; i -= 1) {
      var original = origBreadcrumb[i];
      var clone = original.cloneNode(false); // shallow
      clone.innerHTML = '';

      markAsContinues(original);
      markAsContinuation(clone);

      // Special case for IDs
      if (clone.id) {}
      // console.warn(`Bindery: Added a break to ${elToStr(clone)},
      // so "${clone.id}" is no longer a unique ID.`);


      // Special case for ordered lists
      if (clone.tagName === 'OL') {
        // restart numbering
        var prevStart = 1;
        if (original.hasAttribute('start')) {
          // the OL is also a continuation
          prevStart = parseInt(original.getAttribute('start'), 10);
        }
        if (i < origBreadcrumb.length - 1 && origBreadcrumb[i + 1].tagName === 'LI') {
          // the first list item is a continuation
          prevStart -= 1;
        }
        var prevCount = original.children.length;
        var newStart = prevStart + prevCount;
        clone.setAttribute('start', newStart);
      }

      if (i < origBreadcrumb.length - 1) clone.appendChild(newBreadcrumb[i + 1]);
      newBreadcrumb[i] = clone;
    }

    return newBreadcrumb;
  };
};

exports.default = breadcrumbCloner;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Page = __webpack_require__(4);

var _Page2 = _interopRequireDefault(_Page);

var _convertUnits = __webpack_require__(5);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Styler = function () {
  function Styler() {
    _classCallCheck(this, Styler);
  }

  _createClass(Styler, [{
    key: 'setSize',
    value: function setSize(size) {
      (0, _convertUnits.isValidSize)(size);
      this.size = size;
    }
  }, {
    key: 'setMargin',
    value: function setMargin(margin) {
      (0, _convertUnits.isValidSize)(margin);
      this.margin = margin;
    }
  }, {
    key: 'setBleed',
    value: function setBleed(newBleed) {
      this.bleed = newBleed;
    }
  }, {
    key: 'isSizeValid',
    value: function isSizeValid() {
      this.updateStylesheet();
      return _Page2.default.isSizeValid();
    }
  }, {
    key: 'spreadSizeStyle',
    value: function spreadSizeStyle() {
      var w = (0, _convertUnits.parseVal)(this.size.width);
      return {
        height: this.size.height,
        width: '' + w.val * 2 + w.unit
      };
    }
  }, {
    key: 'updateStylesheet',
    value: function updateStylesheet() {
      var sheet = void 0;
      var existing = document.querySelector('#binderyPageSetup');
      if (existing) {
        sheet = existing;
      } else {
        sheet = document.createElement('style');
        sheet.id = 'binderyPageSetup';
      }
      var w = (0, _convertUnits.parseVal)(this.size.width);

      sheet.innerHTML = '\n      ' + (0, _prefixClass2.default)('.page-size') + ' {\n        height: ' + this.size.height + ';\n        width: ' + this.size.width + ';\n      }\n      ' + (0, _prefixClass2.default)('.two-page-size') + ' {\n        height: ' + this.size.height + ';\n        width: ' + w.val * 2 + w.unit + ';\n      }\n      ' + (0, _prefixClass2.default)('.flowbox') + ',\n      ' + (0, _prefixClass2.default)('.footer') + ' {\n        margin-left: ' + this.margin.inner + ';\n        margin-right: ' + this.margin.outer + ';\n      }\n      ' + (0, _prefixClass2.default)('.left') + ' ' + (0, _prefixClass2.default)('.flowbox') + ',\n      ' + (0, _prefixClass2.default)('.left') + ' ' + (0, _prefixClass2.default)('.footer') + ' {\n        margin-left: ' + this.margin.outer + ';\n        margin-right: ' + this.margin.inner + ';\n      }\n\n      ' + (0, _prefixClass2.default)('.left') + ' ' + (0, _prefixClass2.default)('.running-header') + ' {\n        left: ' + this.margin.outer + ';\n      }\n      ' + (0, _prefixClass2.default)('.right') + ' ' + (0, _prefixClass2.default)('.running-header') + ' {\n        right: ' + this.margin.outer + ';\n      }\n\n      ' + (0, _prefixClass2.default)('.flowbox') + ' { margin-top: ' + this.margin.top + '; }\n      ' + (0, _prefixClass2.default)('.footer') + '{ margin-bottom: ' + this.margin.bottom + '; }\n\n\n      ' + (0, _prefixClass2.default)('.bleed-left') + ',\n      ' + (0, _prefixClass2.default)('.bleed-right') + ',\n      ' + (0, _prefixClass2.default)('.crop-left') + ',\n      ' + (0, _prefixClass2.default)('.crop-right') + ',\n      ' + (0, _prefixClass2.default)('.crop-fold') + ' {\n        top: calc( -12pt - ' + this.bleed + ' );\n        bottom: calc( -12pt - ' + this.bleed + ' );\n      }\n\n      ' + (0, _prefixClass2.default)('.bleed-top') + ',\n      ' + (0, _prefixClass2.default)('.bleed-bottom') + ',\n      ' + (0, _prefixClass2.default)('.crop-top') + ',\n      ' + (0, _prefixClass2.default)('.crop-bottom') + ' {\n        left: calc( -12pt - ' + this.bleed + ' );\n        right: calc( -12pt - ' + this.bleed + ' );\n      }\n      ' + (0, _prefixClass2.default)('.bleed-left') + '   { left: -' + this.bleed + '; }\n      ' + (0, _prefixClass2.default)('.bleed-right') + '  { right: -' + this.bleed + '; }\n      ' + (0, _prefixClass2.default)('.bleed-top') + '    { top: -' + this.bleed + '; }\n      ' + (0, _prefixClass2.default)('.bleed-bottom') + ' { bottom: -' + this.bleed + '; }\n\n      ' + (0, _prefixClass2.default)('.background') + ' {\n        top: -' + this.bleed + ';\n        bottom: -' + this.bleed + ';\n      }\n      ' + (0, _prefixClass2.default)('.left') + ' ' + (0, _prefixClass2.default)('.background') + ' {\n        left: -' + this.bleed + ';\n      }\n      ' + (0, _prefixClass2.default)('.right') + ' ' + (0, _prefixClass2.default)('.background') + ' {\n        right: -' + this.bleed + ';\n      }\n\n      ' + (0, _prefixClass2.default)('.spread') + (0, _prefixClass2.default)('.right') + ' ' + (0, _prefixClass2.default)('.background') + ' {\n        left: calc(-100% - ' + this.bleed + ');\n      }\n      ' + (0, _prefixClass2.default)('.spread') + (0, _prefixClass2.default)('.left') + ' ' + (0, _prefixClass2.default)('.background') + ' {\n        right: calc(-100% - ' + this.bleed + ');\n      }\n    ';
      document.head.appendChild(sheet);
    }
  }]);

  return Styler;
}();

exports.default = Styler;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

var _Page = __webpack_require__(4);

var _Page2 = _interopRequireDefault(_Page);

var _Controls = __webpack_require__(26);

var _Controls2 = _interopRequireDefault(_Controls);

var _error = __webpack_require__(28);

var _error2 = _interopRequireDefault(_error);

var _Layouts = __webpack_require__(29);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MODE_FLIP = 'interactive';
var MODE_PREVIEW = 'grid';
var MODE_SHEET = 'print';
var MODE_OUTLINE = 'outline';

var ARRANGE_ONE = 'arrange_one';
var ARRANGE_SPREAD = 'arrange_two';
var ARRANGE_BOOKLET = 'arrange_booklet';
// const ARRANGE_SIGNATURE = 'arrange_signature';


var setOrientationCSS = function setOrientationCSS(newValue) {
  var sheet = void 0;
  var existing = document.querySelector('#binderyPrintSetup');
  if (existing) {
    sheet = existing;
  } else {
    sheet = document.createElement('style');
    sheet.id = 'binderyPrintSetup';
  }
  sheet.innerHTML = '@page { size: ' + newValue + '; }';
  document.head.appendChild(sheet);
};

var orderPagesBooklet = function orderPagesBooklet(pages) {
  while (pages.length % 4 !== 0) {
    var spacerPage = new _Page2.default();
    spacerPage.element.style.visibility = 'hidden';
    pages.push(spacerPage);
  }
  var bookletOrder = [];
  var len = pages.length;

  for (var i = 0; i < len / 2; i += 2) {
    bookletOrder.push(pages[len - 1 - i]);
    bookletOrder.push(pages[i]);
    bookletOrder.push(pages[i + 1]);
    bookletOrder.push(pages[len - 2 - i]);
  }

  return bookletOrder;
};

var padPages = function padPages(pages) {
  if (pages.length % 2 !== 0) {
    var pg = new _Page2.default();
    pages.push(pg);
  }
  var spacerPage = new _Page2.default();
  var spacerPage2 = new _Page2.default();
  spacerPage.element.style.visibility = 'hidden';
  spacerPage2.element.style.visibility = 'hidden';
  pages.unshift(spacerPage);
  pages.push(spacerPage2);

  return pages;
};

var Viewer = function () {
  function Viewer(_ref) {
    var bindery = _ref.bindery;

    _classCallCheck(this, Viewer);

    this.book = null;

    this.zoomBox = (0, _hyperscript2.default)((0, _prefixClass2.default)('.zoom-wrap'));
    var spinner = (0, _hyperscript2.default)((0, _prefixClass2.default)('.spinner'));
    this.element = (0, _hyperscript2.default)((0, _prefixClass2.default)('.root'), this.zoomBox, spinner);

    this.doubleSided = true;
    this.printArrange = ARRANGE_SPREAD;
    this.isShowingCropMarks = true;
    this.isShowingBleedMarks = false;
    this.setOrientation('landscape');

    this.mode = MODE_PREVIEW;
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    this.setGrid = this.setGrid.bind(this);
    this.setOutline = this.setOutline.bind(this);
    this.setPrint = this.setPrint.bind(this);
    this.setFlip = this.setFlip.bind(this);

    this.controls = new _Controls2.default({ binder: bindery, viewer: this });

    this.element.appendChild(this.controls.element);
    document.body.appendChild(this.element);
  }

  // Automatically switch into print mode


  _createClass(Viewer, [{
    key: 'listenForPrint',
    value: function listenForPrint() {
      var _this = this;

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
    key: 'listenForResize',
    value: function listenForResize() {
      var _this2 = this;

      window.addEventListener('resize', function () {
        if (!_this2.throttleResize) {
          _this2.updateZoom();
          _this2.throttleResize = setTimeout(function () {
            _this2.throttleResize = null;
          }, 20);
        }
      });
    }
  }, {
    key: 'setOrientation',
    value: function setOrientation(newVal) {
      if (newVal === this.orientation) return;
      this.orientation = newVal;
      setOrientationCSS(newVal);
      if (this.mode === MODE_SHEET) {
        this.render();
      } else {
        this.setPrint();
      }
    }
  }, {
    key: 'setPrintArrange',
    value: function setPrintArrange(newVal) {
      if (newVal === this.printArrange) return;
      this.printArrange = newVal;
      if (this.mode === MODE_SHEET) {
        this.render();
      } else {
        this.setPrint();
      }
    }
  }, {
    key: 'displayError',
    value: function displayError(title, text) {
      if (!this.element.parentNode) {
        document.body.appendChild(this.element);
      }
      if (!this.error) {
        this.zoomBox.innerHTML = '';
        this.error = (0, _error2.default)(title, text);
        this.zoomBox.appendChild(this.error);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.book = null;
      this.zoomBox.innerHTML = '';
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      // TODO this doesn't work if the target is an existing node
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }, {
    key: 'toggleGuides',
    value: function toggleGuides() {
      this.element.classList.toggle((0, _prefixClass2.default)('show-guides'));
    }
  }, {
    key: 'toggleBleed',
    value: function toggleBleed() {
      this.element.classList.add((0, _prefixClass2.default)('show-bleed'));
    }
  }, {
    key: 'toggleDouble',
    value: function toggleDouble() {
      this.doubleSided = !this.doubleSided;
      this.render();
    }
  }, {
    key: 'setMode',
    value: function setMode(newMode) {
      switch (newMode) {
        case 'grid':
        case 'default':
          this.mode = MODE_PREVIEW;
          break;
        case 'interactive':
        case 'flip':
          this.mode = MODE_FLIP;
          break;
        case 'print':
        case 'sheet':
          this.mode = MODE_SHEET;
          break;
        case 'outline':
        case 'outlines':
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
        this.render();
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
        this.render();
      }
    }
  }, {
    key: 'setPrint',
    value: function setPrint() {
      if (this.mode === MODE_SHEET) return;
      this.mode = MODE_SHEET;
      this.render();
    }
  }, {
    key: 'setFlip',
    value: function setFlip() {
      this.mode = MODE_FLIP;
      this.render();
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.book) return;
      if (!this.element.parentNode) {
        document.body.appendChild(this.element);
      }

      this.flaps = [];
      document.body.classList.add((0, _prefixClass2.default)('viewing'));
      this.element.setAttribute('bindery-view-mode', this.mode);

      var scrollPct = document.body.scrollTop / document.body.scrollHeight;

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

      document.body.scrollTop = document.body.scrollHeight * scrollPct;
      this.updateZoom();
    }
  }, {
    key: 'updateZoom',
    value: function updateZoom() {
      if (this.zoomBox.firstElementChild) {
        var scrollPct = document.body.scrollTop / document.body.scrollHeight;
        var exportW = this.zoomBox.getBoundingClientRect().width;
        var contentW = this.zoomBox.firstElementChild.getBoundingClientRect().width;

        var scale = Math.min(1, exportW / (contentW + 20));

        this.zoomBox.style.transform = 'scale(' + scale + ')';
        document.body.scrollTop = document.body.scrollHeight * scrollPct;
      }
    }
  }, {
    key: 'updateGuides',
    value: function updateGuides() {
      this.element.setAttribute('bindery-view-mode', this.mode);
      if (this.mode === MODE_OUTLINE) {
        this.element.classList.add((0, _prefixClass2.default)('show-bleed'));
        this.element.classList.add((0, _prefixClass2.default)('show-guides'));
      } else {
        this.element.classList.remove((0, _prefixClass2.default)('show-bleed'));
        this.element.classList.remove((0, _prefixClass2.default)('show-guides'));
      }
    }
  }, {
    key: 'renderPrint',
    value: function renderPrint() {
      this.element.classList.add((0, _prefixClass2.default)('show-bleed'));
      this.element.classList.remove((0, _prefixClass2.default)('show-guides'));

      this.zoomBox.innerHTML = '';

      var isTwoUp = this.printArrange !== ARRANGE_ONE;
      var isBooklet = this.printArrange === ARRANGE_BOOKLET;
      var orient = this.orientation;

      var pages = this.book.pages.slice();
      if (this.printArrange === ARRANGE_SPREAD) {
        pages = padPages(pages);
      } else if (this.printArrange === ARRANGE_BOOKLET) {
        pages = orderPagesBooklet(pages);
      }

      var fragment = (0, _Layouts.printLayout)(pages, isTwoUp, orient, isBooklet);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'renderGrid',
    value: function renderGrid() {
      this.updateGuides();
      this.zoomBox.innerHTML = '';

      var pages = this.book.pages.slice();

      if (this.doubleSided) pages = padPages(pages);

      var fragment = (0, _Layouts.gridLayout)(pages, this.doubleSided);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'renderInteractive',
    value: function renderInteractive() {
      this.zoomBox.innerHTML = '';
      this.flaps = [];

      this.element.classList.remove((0, _prefixClass2.default)('show-bleed'));
      this.element.classList.remove((0, _prefixClass2.default)('show-guides'));
      this.zoomBox.classList.add((0, _prefixClass2.default)('stage3d'));

      var pages = padPages(this.book.pages.slice());

      var fragment = (0, _Layouts.flipLayout)(pages, this.doubleSided);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'isShowingCropMarks',
    get: function get() {
      return this.element.classList.contains((0, _prefixClass2.default)('show-crop'));
    },
    set: function set(newVal) {
      if (newVal) {
        this.element.classList.add((0, _prefixClass2.default)('show-crop'));
      } else {
        this.element.classList.remove((0, _prefixClass2.default)('show-crop'));
      }
    }
  }, {
    key: 'isShowingBleedMarks',
    get: function get() {
      return this.element.classList.contains((0, _prefixClass2.default)('show-bleed-marks'));
    },
    set: function set(newVal) {
      if (newVal) {
        this.element.classList.add((0, _prefixClass2.default)('show-bleed-marks'));
      } else {
        this.element.classList.remove((0, _prefixClass2.default)('show-bleed-marks'));
      }
    }
  }]);

  return Viewer;
}();

exports.default = Viewer;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _convertUnits = __webpack_require__(5);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

var _components = __webpack_require__(27);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controls = function Controls(opts) {
  var _this = this;

  _classCallCheck(this, Controls);

  this.binder = opts.binder;
  var viewer = opts.viewer;

  var done = function done() {
    _this.binder.cancel();
  };
  var print = function print() {
    viewer.setPrint();
    window.print();
  };

  var printBtn = (0, _components.btnMain)({ onclick: print }, 'Print');

  var layoutControl = void 0;
  var cropToggle = void 0;
  var bleedMarkToggle = void 0;
  var facingToggle = void 0;

  var toggleCrop = function toggleCrop() {
    viewer.isShowingCropMarks = !viewer.isShowingCropMarks;
    cropToggle.classList.toggle('selected');
  };

  var toggleBleedMarks = function toggleBleedMarks() {
    viewer.isShowingBleedMarks = !viewer.isShowingBleedMarks;
    bleedMarkToggle.classList.toggle('selected');
  };

  var toggleFacing = function toggleFacing() {
    facingToggle.classList.toggle('selected');
    layoutControl.classList.toggle('not-facing');
    viewer.toggleDouble();
  };

  cropToggle = (0, _components.switchRow)({ onclick: toggleCrop }, 'Crop Marks');
  cropToggle.classList.add('selected');
  bleedMarkToggle = (0, _components.switchRow)({ onclick: toggleBleedMarks }, 'Bleed Marks');
  facingToggle = (0, _components.switchRow)({ onclick: toggleFacing }, 'Facing Pages');

  facingToggle.classList.add('selected');

  var doneBtn = '';
  if (!this.binder.autorun) {
    doneBtn = (0, _components.btn)({ onclick: done }, 'Done');
  }

  var unitInputs = {
    top: (0, _components.inputNumberUnits)(this.binder.styler.margin.top),
    inner: (0, _components.inputNumberUnits)(this.binder.styler.margin.inner),
    outer: (0, _components.inputNumberUnits)(this.binder.styler.margin.outer),
    bottom: (0, _components.inputNumberUnits)(this.binder.styler.margin.bottom),
    width: (0, _components.inputNumberUnits)(this.binder.styler.size.width),
    height: (0, _components.inputNumberUnits)(this.binder.styler.size.height),
    bleed: (0, _components.inputNumberUnits)(this.binder.styler.bleed)
  };

  var sizeControl = (0, _hyperscript2.default)('.' + (0, _prefixClass2.default)('row') + '.' + (0, _prefixClass2.default)('size'), (0, _hyperscript2.default)('div', 'W', unitInputs.width), (0, _hyperscript2.default)('div', 'H', unitInputs.height));

  var marginPreview = (0, _hyperscript2.default)((0, _prefixClass2.default)('.preview'));
  var marginControl = (0, _hyperscript2.default)('.' + (0, _prefixClass2.default)('row') + '.' + (0, _prefixClass2.default)('margin'), (0, _hyperscript2.default)('.top', unitInputs.top), (0, _hyperscript2.default)('.inner', unitInputs.inner), (0, _hyperscript2.default)('.outer', unitInputs.outer), (0, _hyperscript2.default)('.bottom', unitInputs.bottom), marginPreview);

  layoutControl = (0, _hyperscript2.default)((0, _prefixClass2.default)('.layout-control'), sizeControl, marginControl);

  var bleedAmount = (0, _components.row)('Bleed Amount', unitInputs.bleed);

  var paperSize = (0, _components.row)('Paper Size', (0, _components.select)((0, _components.option)('Letter'), (0, _components.option)({ disabled: true }, '8.5 x 11'), (0, _components.option)({ disabled: true }, ''), (0, _components.option)({ disabled: true }, 'Legal'), (0, _components.option)({ disabled: true }, '8.5 x 14'), (0, _components.option)({ disabled: true }, ''), (0, _components.option)({ disabled: true }, 'Tabloid'), (0, _components.option)({ disabled: true }, '11 x 17'), (0, _components.option)({ disabled: true }, ''), (0, _components.option)({ disabled: true }, 'A4'), (0, _components.option)({ disabled: true }, 'mm x mm')));

  var arrangeSelect = (0, _components.select)((0, _components.option)({ value: 'arrange_one' }, 'Pages'), (0, _components.option)({ value: 'arrange_two', selected: true }, 'Spreads'), (0, _components.option)({ value: 'arrange_booklet' }, 'Booklet'), (0, _components.option)({ disabled: true }, 'Grid'), (0, _components.option)({ disabled: true }, 'Signatures'));
  arrangeSelect.addEventListener('change', function () {
    viewer.setPrintArrange(arrangeSelect.value);
  });
  var arrangement = (0, _components.row)('Print', arrangeSelect);

  var orientationSelect = (0, _components.select)((0, _components.option)({ value: 'landscape' }, 'Landscape'), (0, _components.option)({ value: 'portrait' }, 'Portrait'));
  orientationSelect.addEventListener('change', function () {
    viewer.setOrientation(orientationSelect.value);
  });
  var orientation = (0, _components.row)('Orientation', orientationSelect);

  var validCheck = (0, _hyperscript2.default)('div', { style: {
      display: 'none',
      color: '#e2b200'
    } }, 'Too Small');
  var inProgress = (0, _components.btnLight)({ style: {
      display: 'none',
      'pointer-events': 'none'
    } }, 'Updating...');

  var paginate = function paginate() {
    inProgress.style.display = '';
    forceRefresh.style.display = 'none';
    forceRefreshDebug.style.display = 'none';
    _this.binder.makeBook(function () {
      inProgress.style.display = 'none';
      forceRefresh.style.display = '';
      forceRefreshDebug.style.display = '';
    });
  };
  var forceRefresh = (0, _components.btn)({ onclick: function onclick() {
      _this.binder.debug = false;
      paginate();
    } }, 'Update');

  var viewModes = [(0, _components.viewMode)('grid', viewer.setGrid, 'Preview'), (0, _components.viewMode)('outline', viewer.setOutline, 'Outline'), (0, _components.viewMode)('flip', viewer.setFlip, 'Flip'), (0, _components.viewMode)('print', viewer.setPrint, 'Sheet')];

  var viewSwitcher = _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.viewswitcher')].concat(viewModes));

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
  updateLayoutPreview(this.binder.styler.size, this.binder.styler.margin);

  this.setInProgress = function () {
    header.textContent = 'Paginating...';
    validCheck.style.display = 'none';
    inProgress.style.display = '';
    forceRefresh.style.display = 'none';
  };

  this.updateProgress = function (count) {
    header.textContent = count + ' Pages...';
  };

  this.setDone = function () {
    header.textContent = viewer.book.pages.length + ' Pages';
    inProgress.style.display = 'none';
    forceRefresh.style.display = '';
    validCheck.style.display = 'none';
  };

  this.setInvalid = function () {
    validCheck.style.display = '';
    forceRefresh.style.display = '';
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
    var newBleed = unitInputs.bleed.value;

    var needsUpdate = Object.keys(newMargin).some(function (k) {
      return _this.binder.styler.margin[k] !== newMargin[k];
    }) || Object.keys(newSize).some(function (k) {
      return _this.binder.styler.size[k] !== newSize[k];
    }) || _this.binder.styler.bleed !== newBleed;

    if (needsUpdate) {
      updateLayoutPreview(newSize, newMargin);
      _this.binder.styler.setSize(newSize);
      _this.binder.styler.setMargin(newMargin);
      _this.binder.styler.setBleed(newBleed);
      _this.binder.styler.updateStylesheet();

      if (_this.binder.autoupdate) {
        if (_this.binder.styler.isSizeValid()) {
          _this.binder.makeBook();
        } else {
          _this.setInvalid();
        }
      }
    }
  };

  var updateDelay = void 0;
  var throttledUpdate = function throttledUpdate() {
    clearTimeout(updateDelay);
    updateDelay = setTimeout(updateLayout, 200);
  };

  Object.keys(unitInputs).forEach(function (k) {
    unitInputs[k].addEventListener('change', throttledUpdate);
    unitInputs[k].addEventListener('keyup', throttledUpdate);
  });

  var playSlow = void 0;
  var step = (0, _components.btn)('→', {
    style: { display: 'none' },
    onclick: function onclick() {
      return window.binderyDebug.step();
    }
  });
  var pause = (0, _components.btn)('❙❙', {
    onclick: function onclick() {
      window.binderyDebug.pause();
      pause.style.display = 'none';
      playSlow.style.display = '';
      step.style.display = '';
    }
  });
  playSlow = (0, _components.btn)('▶️', {
    style: { display: 'none' },
    onclick: function onclick() {
      window.binderyDebug.resume();
      playSlow.style.display = 'none';
      pause.style.display = '';
      step.style.display = 'none';
    }
  });
  var debugDone = (0, _components.btn)('Done', {
    onclick: function onclick() {
      window.binderyDebug.finish();
    }
  });
  var forceRefreshDebug = (0, _components.btnLight)('Debug', {
    onclick: function onclick() {
      playSlow.style.display = 'none';
      step.style.display = 'none';
      pause.style.display = '';
      _this.binder.debug = true;
      paginate();
    }
  });

  var debugControls = (0, _components.row)(pause, playSlow, step, debugDone);
  debugControls.classList.add((0, _prefixClass2.default)('debug-controls'));
  printBtn.classList.add((0, _prefixClass2.default)('btn-print'));

  var layoutState = (0, _hyperscript2.default)('div', forceRefresh, forceRefreshDebug, validCheck, inProgress);

  // let debugToggle;
  // const toggleDebug = () => {
  //   debugToggle.classList.toggle('selected');
  //   this.binder.debug = !this.binder.debug;
  // };
  // debugToggle = switchRow({ onclick: toggleDebug }, 'Debug');
  // if (this.binder.debug) debugToggle.classList.add('selected');

  this.element = (0, _hyperscript2.default)((0, _prefixClass2.default)('.controls'), header, arrangement, paperSize, orientation, (0, _components.expandRow)('Marks and Bleed'), (0, _components.expandArea)(cropToggle, bleedMarkToggle, bleedAmount), (0, _components.expandRow)('Pagination'), (0, _components.expandArea)(layoutControl, (0, _components.row)(layoutState)), debugControls, (0, _components.row)(doneBtn, printBtn), viewSwitcher);
};

exports.default = Controls;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.viewMode = exports.inputNumberUnits = exports.switchRow = exports.option = exports.select = exports.btnMain = exports.btnLight = exports.btn = exports.heading = exports.expandArea = exports.expandRow = exports.row = exports.title = undefined;

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

var _convertUnits = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var title = function title() {
  for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
    arg[_key] = arguments[_key];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.title')].concat(arg));
};

// Structure
var heading = function heading() {
  for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    arg[_key2] = arguments[_key2];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.heading')].concat(arg));
};

var row = function row() {
  for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    arg[_key3] = arguments[_key3];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.row')].concat(arg));
};

var expandRow = function expandRow() {
  for (var _len4 = arguments.length, arg = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    arg[_key4] = arguments[_key4];
  }

  return _hyperscript2.default.apply(undefined, ['.' + (0, _prefixClass2.default)('row') + '.' + (0, _prefixClass2.default)('expand-row'), {
    onclick: function onclick() {
      this.classList.toggle('selected');
    }
  }].concat(arg));
};
var expandArea = function expandArea() {
  for (var _len5 = arguments.length, arg = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    arg[_key5] = arguments[_key5];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.expand-area')].concat(arg));
};

// Button
var btn = function btn() {
  for (var _len6 = arguments.length, arg = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    arg[_key6] = arguments[_key6];
  }

  return _hyperscript2.default.apply(undefined, ['button.' + (0, _prefixClass2.default)('btn')].concat(arg));
};

var btnLight = function btnLight() {
  for (var _len7 = arguments.length, arg = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    arg[_key7] = arguments[_key7];
  }

  return _hyperscript2.default.apply(undefined, ['button.' + (0, _prefixClass2.default)('btn') + '.' + (0, _prefixClass2.default)('btn-light')].concat(arg));
};

var btnMain = function btnMain() {
  for (var _len8 = arguments.length, arg = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    arg[_key8] = arguments[_key8];
  }

  return _hyperscript2.default.apply(undefined, ['button.' + (0, _prefixClass2.default)('btn') + '.' + (0, _prefixClass2.default)('btn-main')].concat(arg));
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
  return (0, _hyperscript2.default)((0, _prefixClass2.default)('.switch'), (0, _hyperscript2.default)((0, _prefixClass2.default)('.switch-handle')));
};

var switchRow = function switchRow() {
  for (var _len11 = arguments.length, arg = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
    arg[_key11] = arguments[_key11];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.row')].concat(arg, [toggleSwitch]));
};

// View Swithcer
var viewMode = function viewMode(id, action, text) {
  var sel = '.' + (0, _prefixClass2.default)('viewmode') + '.' + (0, _prefixClass2.default)(id);
  return (0, _hyperscript2.default)(sel, { onclick: action }, (0, _hyperscript2.default)((0, _prefixClass2.default)('.icon')), text);
};

exports.title = title;
exports.row = row;
exports.expandRow = expandRow;
exports.expandArea = expandArea;
exports.heading = heading;
exports.btn = btn;
exports.btnLight = btnLight;
exports.btnMain = btnMain;
exports.select = select;
exports.option = option;
exports.switchRow = switchRow;
exports.inputNumberUnits = inputNumberUnits;
exports.viewMode = viewMode;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (title, text) {
  return (0, _hyperscript2.default)((0, _prefixClass2.default)('.error'), (0, _hyperscript2.default)((0, _prefixClass2.default)('.error-title'), title), (0, _hyperscript2.default)((0, _prefixClass2.default)('.error-text'), text), (0, _hyperscript2.default)((0, _prefixClass2.default)('.error-footer'), 'Bindery ' + '2.0.0-alpha.4.1'));
};

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flipLayout = exports.printLayout = exports.gridLayout = undefined;

var _gridLayout = __webpack_require__(30);

var _gridLayout2 = _interopRequireDefault(_gridLayout);

var _printLayout = __webpack_require__(31);

var _printLayout2 = _interopRequireDefault(_printLayout);

var _flipLayout = __webpack_require__(33);

var _flipLayout2 = _interopRequireDefault(_flipLayout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.gridLayout = _gridLayout2.default;
exports.printLayout = _printLayout2.default;
exports.flipLayout = _flipLayout2.default;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var twoPageSpread = function twoPageSpread() {
  for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
    arg[_key] = arguments[_key];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.spread-wrapper') + (0, _prefixClass2.default)('.two-page-size')].concat(arg));
};
var onePageSpread = function onePageSpread() {
  for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    arg[_key2] = arguments[_key2];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.spread-wrapper') + (0, _prefixClass2.default)('.page-size')].concat(arg));
};

var renderGridLayout = function renderGridLayout(pages, isTwoUp) {
  var gridLayout = document.createDocumentFragment();
  if (isTwoUp) {
    for (var i = 0; i < pages.length; i += 2) {
      var wrap = twoPageSpread(pages[i].element, pages[i + 1].element);
      gridLayout.appendChild(wrap);
    }
  } else {
    pages.forEach(function (pg) {
      var wrap = onePageSpread(pg.element);
      gridLayout.appendChild(wrap);
    });
  }

  return gridLayout;
};

exports.default = renderGridLayout;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

var _printMarks = __webpack_require__(32);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var twoPageSpread = function twoPageSpread() {
  for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
    arg[_key] = arguments[_key];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.spread-wrapper') + (0, _prefixClass2.default)('.two-page-size')].concat(arg));
};
var onePageSpread = function onePageSpread() {
  for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    arg[_key2] = arguments[_key2];
  }

  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.spread-wrapper') + (0, _prefixClass2.default)('.page-size')].concat(arg));
};

var renderPrintLayout = function renderPrintLayout(pages, isTwoUp, orient, isBooklet) {
  var printLayout = document.createDocumentFragment();

  var marks = isTwoUp ? _printMarks.printMarksSpread : _printMarks.printMarksSingle;
  var spread = isTwoUp ? twoPageSpread : onePageSpread;

  var printSheet = function printSheet() {
    for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      arg[_key3] = arguments[_key3];
    }

    return (0, _hyperscript2.default)((0, _prefixClass2.default)('.print-page') + (0, _prefixClass2.default)('.letter-' + orient), spread.apply(undefined, arg.concat([marks()])));
  };

  if (isTwoUp) {
    for (var i = 0; i < pages.length; i += 2) {
      var sheet = printSheet(pages[i].element, pages[i + 1].element);
      printLayout.appendChild(sheet);
      if (isBooklet) {
        var meta = (0, _printMarks.bookletMeta)(i, pages.length);
        sheet.appendChild(meta);
      }
    }
  } else {
    pages.forEach(function (pg) {
      var sheet = printSheet(pg.element);
      printLayout.appendChild(sheet);
    });
  }

  return printLayout;
};

exports.default = renderPrintLayout;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bookletMeta = exports.printMarksSpread = exports.printMarksSingle = undefined;

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var bleedMarks = function bleedMarks() {
  return [(0, _hyperscript2.default)((0, _prefixClass2.default)('.bleed-top')), (0, _hyperscript2.default)((0, _prefixClass2.default)('.bleed-bottom')), (0, _hyperscript2.default)((0, _prefixClass2.default)('.bleed-left')), (0, _hyperscript2.default)((0, _prefixClass2.default)('.bleed-right'))];
};
var cropMarks = function cropMarks() {
  return [(0, _hyperscript2.default)((0, _prefixClass2.default)('.crop-top')), (0, _hyperscript2.default)((0, _prefixClass2.default)('.crop-bottom')), (0, _hyperscript2.default)((0, _prefixClass2.default)('.crop-left')), (0, _hyperscript2.default)((0, _prefixClass2.default)('.crop-right'))];
};
var printMarksSingle = function printMarksSingle() {
  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.print-mark-wrap')].concat(_toConsumableArray(cropMarks()), _toConsumableArray(bleedMarks())));
};
var printMarksSpread = function printMarksSpread() {
  return _hyperscript2.default.apply(undefined, [(0, _prefixClass2.default)('.print-mark-wrap'), (0, _hyperscript2.default)((0, _prefixClass2.default)('.crop-fold'))].concat(_toConsumableArray(cropMarks()), _toConsumableArray(bleedMarks())));
};

var bookletMeta = function bookletMeta(i, len) {
  var isFront = i % 4 === 0;
  var sheetIndex = parseInt((i + 1) / 4, 10) + 1;
  return (0, _hyperscript2.default)((0, _prefixClass2.default)('.print-meta'), 'Sheet ' + sheetIndex + ' of ' + len / 4 + ': ' + (isFront ? 'Outside' : 'Inside'));
};

exports.printMarksSingle = printMarksSingle;
exports.printMarksSpread = printMarksSpread;
exports.bookletMeta = bookletMeta;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var renderFlipLayout = function renderFlipLayout(pages, doubleSided) {
  var flipLayout = document.createDocumentFragment();
  var flaps = [];
  var currentLeaf = 0;

  var setLeaf = function setLeaf(n) {
    var newLeaf = n;
    if (newLeaf === currentLeaf) newLeaf += 1;

    currentLeaf = newLeaf;
    var zScale = 4;
    if (flaps.length * zScale > 200) zScale = 200 / flaps.length;

    flaps.forEach(function (flap, i, arr) {
      // + 0.5 so left and right are even
      var z = (arr.length - Math.abs(i - n + 0.5)) * zScale;
      flap.style.transform = 'translate3d(' + (i < n ? 4 : 0) + 'px,0,' + z + 'px) rotateY(' + (i < n ? -180 : 0) + 'deg)';
    });
  };

  var leafIndex = 0;

  var _loop = function _loop(i) {
    leafIndex += 1;
    var li = leafIndex;
    var flap = (0, _hyperscript2.default)((0, _prefixClass2.default)('.page3d'), {
      onclick: function onclick() {
        var newLeaf = li - 1;
        setLeaf(newLeaf);
      }
    });

    var rightPage = pages[i].element;
    var leftPage = void 0;
    rightPage.classList.add((0, _prefixClass2.default)('page3d-front'));
    flap.appendChild(rightPage);
    if (doubleSided) {
      flap.classList.add((0, _prefixClass2.default)('doubleSided'));
      leftPage = pages[i + 1].element;
      leftPage.classList.add((0, _prefixClass2.default)('page3d-back'));
      flap.appendChild(leftPage);
    } else {
      leftPage = (0, _hyperscript2.default)((0, _prefixClass2.default)('.page') + (0, _prefixClass2.default)('.page3d-back'));
      flap.appendChild(leftPage);
    }
    // TODO: Dynamically add/remove pages.
    // Putting 1000s of elements onscreen
    // locks up the browser.

    var leftOffset = 4;
    if (pages.length * leftOffset > 300) leftOffset = 300 / pages.length;

    flap.style.left = i * leftOffset + 'px';

    flaps.push(flap);
    flipLayout.appendChild(flap);
  };

  for (var i = 1; i < pages.length - 1; i += doubleSided ? 2 : 1) {
    _loop(i);
  }

  setLeaf(0);
  return flipLayout;
};

exports.default = renderFlipLayout;

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Continuation2 = __webpack_require__(35);

var _Continuation3 = _interopRequireDefault(_Continuation2);

var _FullBleedSpread2 = __webpack_require__(36);

var _FullBleedSpread3 = _interopRequireDefault(_FullBleedSpread2);

var _FullBleedPage2 = __webpack_require__(37);

var _FullBleedPage3 = _interopRequireDefault(_FullBleedPage2);

var _Footnote2 = __webpack_require__(38);

var _Footnote3 = _interopRequireDefault(_Footnote2);

var _PageReference2 = __webpack_require__(39);

var _PageReference3 = _interopRequireDefault(_PageReference2);

var _RunningHeader2 = __webpack_require__(40);

var _RunningHeader3 = _interopRequireDefault(_RunningHeader2);

var _Replace2 = __webpack_require__(6);

var _Replace3 = _interopRequireDefault(_Replace2);

var _Rule = __webpack_require__(3);

var _Rule2 = _interopRequireDefault(_Rule);

var _PageBreak2 = __webpack_require__(41);

var _PageBreak3 = _interopRequireDefault(_PageBreak2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Rule: _Rule2.default,
  Continuation: function Continuation(options) {
    return new _Continuation3.default(options);
  },
  FullBleedPage: function FullBleedPage(options) {
    return new _FullBleedPage3.default(options);
  },
  Footnote: function Footnote(options) {
    return new _Footnote3.default(options);
  },
  RunningHeader: function RunningHeader(options) {
    return new _RunningHeader3.default(options);
  },
  Replace: function Replace(options) {
    return new _Replace3.default(options);
  },
  FullBleedSpread: function FullBleedSpread(options) {
    return new _FullBleedSpread3.default(options);
  },
  PageBreak: function PageBreak(options) {
    return new _PageBreak3.default(options);
  },
  PageReference: function PageReference(options) {
    return new _PageReference3.default(options);
  },
  createRule: function createRule(options) {
    return new _Rule2.default(options);
  }
};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Rule2 = __webpack_require__(3);

var _Rule3 = _interopRequireDefault(_Rule2);

var _RuleOption = __webpack_require__(2);

var _RuleOption2 = _interopRequireDefault(_RuleOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Options:
// selector: String
// isContinuationClass: String
// hasContinuationClass: String

var Continuation = function (_Rule) {
  _inherits(Continuation, _Rule);

  function Continuation(options) {
    _classCallCheck(this, Continuation);

    options.hasContinuationClass = options.hasContinuationClass || 'my-continues';
    options.isContinuationClass = options.isContinuationClass || 'my-continuation';

    var _this = _possibleConstructorReturn(this, (Continuation.__proto__ || Object.getPrototypeOf(Continuation)).call(this, options));

    _this.name = 'Continuation';
    _this.validate(options, {
      selector: _RuleOption2.default.string,
      hasContinuationClass: _RuleOption2.default.string,
      isContinuationClass: _RuleOption2.default.string
    });
    return _this;
  }

  _createClass(Continuation, [{
    key: 'customContinuesClass',
    get: function get() {
      return this.hasContinuationClass;
    }
  }, {
    key: 'customContinuationClass',
    get: function get() {
      return this.isContinuationClass;
    }
  }]);

  return Continuation;
}(_Rule3.default);

exports.default = Continuation;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _OutOfFlow2 = __webpack_require__(9);

var _OutOfFlow3 = _interopRequireDefault(_OutOfFlow2);

var _RuleOption = __webpack_require__(2);

var _RuleOption2 = _interopRequireDefault(_RuleOption);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Options:
// selector: String

var FullBleedSpread = function (_OutOfFlow) {
  _inherits(FullBleedSpread, _OutOfFlow);

  function FullBleedSpread(options) {
    _classCallCheck(this, FullBleedSpread);

    options.continue = options.continue || 'same';

    var _this = _possibleConstructorReturn(this, (FullBleedSpread.__proto__ || Object.getPrototypeOf(FullBleedSpread)).call(this, options));

    _this.name = 'Full Bleed Spread';
    _this.validate(options, {
      selector: _RuleOption2.default.string,
      continue: _RuleOption2.default.enum('next', 'same', 'left', 'right')
    });
    return _this;
  }

  _createClass(FullBleedSpread, [{
    key: 'addElementOutOfFlow',
    value: function addElementOutOfFlow(elmt, state, makeNewPage) {
      var leftPage = void 0;
      if (state.currentPage.isEmpty) {
        leftPage = state.currentPage;
      } else {
        leftPage = makeNewPage();
        state.pages.push(leftPage);
      }

      var rightPage = makeNewPage();
      state.pages.push(rightPage);

      leftPage.background.appendChild(elmt);
      leftPage.element.classList.add((0, _prefixClass2.default)('spread'));
      leftPage.setPreference('left');
      leftPage.isOutOfFlow = this.continue === 'same';

      rightPage.background.appendChild(elmt.cloneNode(true));
      rightPage.element.classList.add((0, _prefixClass2.default)('spread'));
      rightPage.setPreference('right');
      rightPage.isOutOfFlow = this.continue === 'same';
    }
  }]);

  return FullBleedSpread;
}(_OutOfFlow3.default);

exports.default = FullBleedSpread;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _OutOfFlow2 = __webpack_require__(9);

var _OutOfFlow3 = _interopRequireDefault(_OutOfFlow2);

var _RuleOption = __webpack_require__(2);

var _RuleOption2 = _interopRequireDefault(_RuleOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Options:
// selector: String

// TODO: Redesign to add entire element in one go, ignoring bleed and any
// internal rules.

var FullBleedPage = function (_OutOfFlow) {
  _inherits(FullBleedPage, _OutOfFlow);

  function FullBleedPage(options) {
    _classCallCheck(this, FullBleedPage);

    options.continue = options.continue || 'same';

    var _this = _possibleConstructorReturn(this, (FullBleedPage.__proto__ || Object.getPrototypeOf(FullBleedPage)).call(this, options));

    _this.name = 'Full Bleed Page';
    _this.validate(options, {
      selector: _RuleOption2.default.string,
      continue: _RuleOption2.default.enum('next', 'same', 'left', 'right')
    });
    return _this;
  }

  _createClass(FullBleedPage, [{
    key: 'addElementOutOfFlow',
    value: function addElementOutOfFlow(elmt, state, makeNewPage) {
      if (state.currentPage.isEmpty) {
        state.currentPage.background.appendChild(elmt);
      } else {
        var outOfFlowPage = makeNewPage();
        outOfFlowPage.background.appendChild(elmt);
        state.pages.push(outOfFlowPage);
      }
    }
  }]);

  return FullBleedPage;
}(_OutOfFlow3.default);

exports.default = FullBleedPage;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _Replace2 = __webpack_require__(6);

var _Replace3 = _interopRequireDefault(_Replace2);

var _RuleOption = __webpack_require__(2);

var _RuleOption2 = _interopRequireDefault(_RuleOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
// render: function (Page) => HTMLElement

var Footnote = function (_Replace) {
  _inherits(Footnote, _Replace);

  function Footnote(options) {
    _classCallCheck(this, Footnote);

    var _this = _possibleConstructorReturn(this, (Footnote.__proto__ || Object.getPrototypeOf(Footnote)).call(this, options));

    _this.name = 'Footnote';
    _this.validate(options, {
      selector: _RuleOption2.default.string,
      replace: _RuleOption2.default.func,
      render: _RuleOption2.default.func
    });
    return _this;
  }

  _createClass(Footnote, [{
    key: 'afterAdd',
    value: function afterAdd(element, state, requestNewPage, overflowCallback) {
      var number = state.currentPage.footer.children.length + 1;

      var footnote = (0, _hyperscript2.default)('.footnote');
      var contents = this.render(element, number);
      if (contents instanceof HTMLElement) footnote.appendChild(contents);else footnote.innerHTML = contents;

      state.currentPage.footer.appendChild(footnote);

      return _get(Footnote.prototype.__proto__ || Object.getPrototypeOf(Footnote.prototype), 'afterAdd', this).call(this, element, state, requestNewPage, function (overflowEl) {
        state.currentPage.footer.removeChild(footnote);
        return overflowCallback(overflowEl);
      });
    }
  }, {
    key: 'createReplacement',
    value: function createReplacement(state, element) {
      var number = state.currentPage.footer.children.length;
      return this.replace(element, number);
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
}(_Replace3.default);

exports.default = Footnote;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Replace2 = __webpack_require__(6);

var _Replace3 = _interopRequireDefault(_Replace2);

var _RuleOption = __webpack_require__(2);

var _RuleOption2 = _interopRequireDefault(_RuleOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement

var makeRanges = function makeRanges(arr) {
  return arr.reduce(function (soFar, curr, i) {
    if (i === 0) return soFar + curr;
    var prev = arr[i - 1];
    if (i === arr.length - 1) return soFar + '\u2013' + curr;
    if (curr === prev + 1) return soFar;
    if (i === 1) return soFar + ', ' + curr;
    return soFar + '\u2013' + prev + ', ' + curr;
  }, '');
};

var PageReference = function (_Replace) {
  _inherits(PageReference, _Replace);

  function PageReference(options) {
    _classCallCheck(this, PageReference);

    var _this = _possibleConstructorReturn(this, (PageReference.__proto__ || Object.getPrototypeOf(PageReference)).call(this, options));

    _this.name = 'Page Reference';
    _this.validate(options, {
      selector: _RuleOption2.default.string,
      replace: _RuleOption2.default.func,
      createTest: _RuleOption2.default.func
    });
    return _this;
  }

  _createClass(PageReference, [{
    key: 'afterAdd',
    value: function afterAdd(elmt, state) {
      var _this2 = this;

      var test = this.createTest(elmt);
      if (test) {
        // Temporary, to make sure it'll fit
        var parent = elmt.parentNode;
        var tempClone = elmt.cloneNode(true);
        var temp = this.replace(tempClone, '###');
        parent.replaceChild(temp, elmt);

        state.book.onComplete(function () {
          var tempParent = temp.parentNode;
          var finalClone = elmt.cloneNode(true);
          var pageNumbers = state.book.pagesForTest(test);
          var pageRanges = makeRanges(pageNumbers);
          var newEl = _this2.replace(finalClone, pageRanges);
          tempParent.replaceChild(newEl, temp);
        });

        return temp;
      }
      return elmt;
    }
  }, {
    key: 'createTest',
    value: function createTest(element) {
      var selector = element.getAttribute('href');
      if (selector) {
        selector = selector.replace('#', '');
        // in case it starts with a number :( thanks wikipedia
        selector = '[id="' + selector + '"]';
        return function (el) {
          return el.querySelector(selector);
        };
      }
      return null;
    }
  }, {
    key: 'replace',
    value: function replace(original, number) {
      original.insertAdjacentHTML('beforeend', ', ' + number);
      return original;
    }
  }]);

  return PageReference;
}(_Replace3.default);

exports.default = PageReference;

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hyperscript = __webpack_require__(1);

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _Rule2 = __webpack_require__(3);

var _Rule3 = _interopRequireDefault(_Rule2);

var _RuleOption = __webpack_require__(2);

var _RuleOption2 = _interopRequireDefault(_RuleOption);

var _prefixClass = __webpack_require__(0);

var _prefixClass2 = _interopRequireDefault(_prefixClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Options:
// selector: String
// render: function (Page) => HTMLElement
// TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

var RunningHeader = function (_Rule) {
  _inherits(RunningHeader, _Rule);

  function RunningHeader() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RunningHeader);

    var _this = _possibleConstructorReturn(this, (RunningHeader.__proto__ || Object.getPrototypeOf(RunningHeader)).call(this, options));

    _this.name = 'Running Header';
    _this.validate(options, {
      render: _RuleOption2.default.func
    });
    return _this;
  }

  _createClass(RunningHeader, [{
    key: 'afterBind',
    value: function afterBind(page) {
      var el = (0, _hyperscript2.default)((0, _prefixClass2.default)('.running-header'));
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
}(_Rule3.default);

exports.default = RunningHeader;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Rule2 = __webpack_require__(3);

var _Rule3 = _interopRequireDefault(_Rule2);

var _RuleOption = __webpack_require__(2);

var _RuleOption2 = _interopRequireDefault(_RuleOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PageBreak = function (_Rule) {
  _inherits(PageBreak, _Rule);

  function PageBreak(options) {
    _classCallCheck(this, PageBreak);

    options.position = options.position || 'before';
    options.continue = options.continue || 'any';

    var _this = _possibleConstructorReturn(this, (PageBreak.__proto__ || Object.getPrototypeOf(PageBreak)).call(this, options));

    _this.name = 'Page Break';
    _this.validate(options, {
      selector: _RuleOption2.default.string,
      continue: _RuleOption2.default.enum('any', 'left', 'right'),
      position: _RuleOption2.default.enum('before', 'after', 'both', 'avoid')
    });
    return _this;
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
  }, {
    key: 'avoidSplit',
    get: function get() {
      return this.position === 'avoid';
    }
  }]);

  return PageBreak;
}(_Rule3.default);

exports.default = PageBreak;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(43);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(50)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./main.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./main.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(44)();
// imports


// module
exports.push([module.i, "@charset \"UTF-8\";\n@media screen {\n  .📖-page {\n    background: white;\n    outline: 1px solid rgba(0, 0, 0, 0.1);\n    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);\n    overflow: hidden; }\n    .📖-show-bleed .📖-page {\n      box-shadow: none;\n      outline: none;\n      overflow: visible; }\n    .📖-page3d .📖-page {\n      overflow: hidden !important; }\n    .📖-page::after {\n      content: \"\";\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      pointer-events: none;\n      z-index: 999; }\n  .📖-zoom-wrap * {\n    transition: box-shadow 0.2s; }\n  .📖-show-guides .bindery-zoom-wrap * {\n    box-shadow: inset 0 0 0 1px rgba(0, 92, 255, 0.2); }\n  .📖-show-guides .📖-page::after {\n    box-shadow: 0 0 0 1px magenta; }\n  .📖-show-guides .📖-flowbox {\n    box-shadow: 0 0 0 1px cyan; }\n  .📖-show-guides .📖-footer {\n    box-shadow: 0 0 0 1px cyan; }\n  .📖-show-guides .📖-running-header {\n    box-shadow: 0 0 0 1px cyan; }\n  .📖-show-guides .📖-content {\n    box-shadow: inset 0 0 0 1px blue; }\n  .📖-show-guides .📖-background {\n    box-shadow: 0 0 0 1px yellow; }\n  .📖-show-guides .📖-out-of-flow {\n    display: block;\n    outline: 1px solid cyan; }\n    .📖-show-guides .📖-out-of-flow::after {\n      font: 10px/1.4 -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n      content: attr(data-bindery);\n      position: absolute;\n      background: rgba(0, 255, 255, 0.5);\n      padding: 4px; }\n  .📖-show-guides .📖-right .📖-out-of-flow::after {\n    left: 100%; }\n  .📖-show-guides .📖-left .📖-out-of-flow::after {\n    right: 100%; }\n  .📖-is-overflowing {\n    overflow: visible; }\n    .📖-is-overflowing::before {\n      transition: none;\n      content: \"+\";\n      position: absolute;\n      bottom: 0;\n      display: block;\n      margin: 0 auto -10px;\n      left: 0;\n      right: 0;\n      text-align: center;\n      font: 8px/1.3 -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n      font-weight: 500;\n      text-transform: uppercase;\n      letter-spacing: 0.1em;\n      color: #ad0000;\n      width: 12px;\n      background: white;\n      z-index: 999;\n      border-radius: 2px;\n      padding: 4px;\n      overflow: hidden;\n      border: 1px solid currentColor; }\n    .📖-is-overflowing:hover::before {\n      content: \"Overflow\";\n      width: 54px; }\n    .📖-is-overflowing .📖-content {\n      transition: none; }\n      .📖-is-overflowing .📖-content:hover::after {\n        box-shadow: inset 0 0 0 1px #ad0000;\n        background: rgba(173, 0, 0, 0.04);\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0; } }\n\n.📖-out-of-flow {\n  display: none; }\n\n.📖-page {\n  width: 200px;\n  height: 300px;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  flex-wrap: nowrap;\n  margin: auto; }\n\n.📖-flowbox {\n  position: relative;\n  margin: 60px 40px;\n  margin-bottom: 0;\n  flex: 1 1 auto;\n  min-height: 0; }\n\n.📖-content {\n  /* hack to prevent margin collapse, leading to wrong height */\n  padding: 0.1px;\n  position: relative; }\n\n.📖-footer {\n  margin: 60px 40px;\n  margin-top: 8pt;\n  flex: 0 1 auto;\n  z-index: 2; }\n\n.📖-footer > :first-child:before {\n  content: \"\";\n  display: block;\n  width: 24pt;\n  height: 1px;\n  box-shadow: inset 0 0.5px 0 0 black;\n  margin-bottom: 8pt; }\n\n/*Bleed as layer*/\n.📖-background {\n  position: absolute;\n  z-index: 0;\n  overflow: hidden; }\n  .📖-left .📖-background {\n    right: 0; }\n  .📖-right .📖-background {\n    left: 0; }\n\n.📖-sup {\n  font-size: 0.667em; }\n\n.📖-running-header, .📖-footer {\n  font-size: 10pt; }\n\n.📖-running-header {\n  position: absolute;\n  text-align: center;\n  top: 0.25in; }\n  .📖-left .📖-running-header {\n    left: 18pt;\n    text-align: left; }\n  .📖-right .📖-running-header {\n    right: 18pt;\n    text-align: right; }\n\np.📖-continuation {\n  text-indent: 0 !important; }\n\nli.📖-continuation {\n  list-style: none !important; }\n\n.📖-print-mark-wrap {\n  display: none;\n  position: absolute;\n  pointer-events: none;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 999; }\n  .📖-show-crop .📖-print-mark-wrap,\n  .📖-show-bleed-marks .📖-print-mark-wrap {\n    display: block; }\n  .📖-show-crop .📖-print-mark-wrap > [class*='crop'] {\n    display: block; }\n  .📖-show-bleed-marks .📖-print-mark-wrap > [class*='bleed'] {\n    display: block; }\n  .📖-print-mark-wrap > div {\n    display: none;\n    position: absolute;\n    overflow: hidden; }\n    .📖-print-mark-wrap > div::before, .📖-print-mark-wrap > div:after {\n      content: \"\";\n      background: black;\n      width: 12pt;\n      height: 12pt;\n      display: block;\n      position: absolute; }\n    .📖-print-mark-wrap > div:before {\n      top: 0;\n      left: 0; }\n    .📖-print-mark-wrap > div:after {\n      bottom: 0;\n      right: 0; }\n\n.📖-show-crop .📖-print-page .📖-spread-wrapper,\n.📖-show-bleed-marks .📖-print-page .📖-spread-wrapper {\n  margin: 30pt auto; }\n\n.📖-crop-fold, .📖-crop-left, .📖-crop-right {\n  transform: scaleX(0.5);\n  width: 1px;\n  margin: auto; }\n\n.📖-crop-fold {\n  right: 0;\n  left: 0; }\n\n.📖-crop-left {\n  left: 0; }\n\n.📖-crop-right {\n  right: 0; }\n\n.📖-crop-top, .📖-crop-bottom {\n  transform: scaleY(0.5);\n  height: 1px; }\n\n.📖-crop-top {\n  top: 0; }\n\n.📖-crop-bottom {\n  bottom: 0; }\n\n.📖-bleed-left, .📖-bleed-right {\n  transform: scaleX(0.5);\n  width: 1px;\n  margin: auto; }\n\n.📖-bleed-top, .📖-bleed-bottom {\n  transform: scaleY(0.5);\n  height: 1px; }\n\n@media screen {\n  .📖-viewing {\n    background: #f4f4f4 !important; }\n  .📖-root {\n    transition: opacity 0.2s;\n    opacity: 1;\n    background: #f4f4f4;\n    padding: 20px;\n    z-index: 99;\n    position: relative;\n    padding-right: 240px;\n    animation: fadeUp 0.3s;\n    min-height: 90vh; }\n  .📖-measure-area {\n    position: fixed;\n    background: #f4f4f4;\n    padding: 50px 20px;\n    z-index: 99;\n    visibility: hidden;\n    top: 0;\n    left: 0;\n    right: 240px;\n    bottom: 0; }\n    .📖-debug .📖-measure-area {\n      overflow: scroll;\n      visibility: visible; }\n    .📖-measure-area .📖-page {\n      margin: 0 auto 50px; }\n  .📖-print-page {\n    margin: 0 auto; }\n  .📖-spinner {\n    border: 2px solid transparent;\n    border-left-color: #1b00ff;\n    width: 32px;\n    height: 32px;\n    border-radius: 50%;\n    position: absolute;\n    top: 0;\n    left: 0;\n    bottom: 0;\n    right: 0;\n    margin: auto;\n    z-index: 999;\n    opacity: 0; }\n  .📖-in-progress .📖-spinner {\n    opacity: 1;\n    animation: spin 0.6s linear infinite; }\n  .📖-error {\n    font: 16px/1.4 -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n    margin: 15vh 15vw;\n    max-width: 500px;\n    background: url(" + __webpack_require__(45) + ") no-repeat 0% 0%;\n    background-size: 48px;\n    padding-top: 64px; }\n    .📖-error-title {\n      font-size: 1.5em;\n      margin-bottom: 16px; }\n    .📖-error-text {\n      margin-bottom: 16px;\n      white-space: pre-line; }\n    .📖-error-footer {\n      opacity: 0.5;\n      font-size: 0.66em;\n      text-transform: uppercase;\n      letter-spacing: 0.02em; }\n  .📖-show-bleed .📖-print-page {\n    background: white;\n    outline: 1px solid rgba(0, 0, 0, 0.1);\n    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);\n    margin: 20px auto; }\n  .📖-letter-landscape {\n    width: 11in;\n    height: 8.5in; }\n  .📖-letter-portrait {\n    width: 8.5in;\n    height: 11in; } }\n\n@keyframes fadeUp {\n  0% {\n    opacity: 0; }\n  100% {\n    opacity: 1; } }\n\n@keyframes spin {\n  0% {\n    transform: rotateZ(0); }\n  100% {\n    transform: rotateZ(360deg); } }\n\n@page {\n  margin: 0; }\n\n@media print {\n  .📖-root {\n    -webkit-print-color-adjust: exact; }\n  /* Don't print anything that hasn't been exported. This hides extra controls/ */\n  .📖-viewing > :not(.📖-root) {\n    display: none !important; }\n  .📖-controls {\n    display: none !important; }\n  .📖-print-page {\n    margin: 0; }\n  .📖-zoom-wrap[style] {\n    transform: none !important; } }\n\nbody.📖-viewing {\n  margin: 0; }\n\n.📖-zoom-wrap {\n  transform-origin: top left;\n  transform-style: preserve-3d;\n  height: calc(100vh - 40px);\n  /* adjust scrollheight on scaled down */ }\n\n/* Don't print anything that hasn't been exported. This hides extra controls */\n/* TODO: make selectors more reasonable */\n.📖-viewing > :not(.📖-root):not(.📖-measure-area) {\n  display: none !important; }\n\n.📖-print-page {\n  page-break-after: always;\n  position: relative;\n  overflow: hidden; }\n\n.📖-spread-wrapper {\n  position: relative;\n  display: flex;\n  width: 800px;\n  margin: 0 auto 50px; }\n\n.📖-print-page .📖-spread-wrapper {\n  margin: 0 auto; }\n\n.📖-print-meta {\n  padding: 12pt;\n  text-align: center;\n  font-family: -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n  font-size: 8pt; }\n\n.📖-stage3d {\n  perspective: 3000px;\n  transform-style: preserve-3d; }\n\n.📖-page3d {\n  margin: auto;\n  width: 400px;\n  height: 600px;\n  transform: rotateY(0);\n  transform-style: preserve-3d;\n  transform-origin: left;\n  transition: transform 0.5s, box-shadow 0.1s;\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0; }\n  .📖-page3d:hover {\n    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.2); }\n  .📖-page3d.flipped {\n    transform: rotateY(-180deg); }\n  .📖-page3d .📖-page {\n    position: absolute;\n    backface-visibility: hidden; }\n  .📖-page3d .📖-page3d-front {\n    transform: rotateY(0); }\n    .📖-page3d .📖-page3d-front::after {\n      box-shadow: inset 12px 0 12px -12px rgba(0, 0, 0, 0.4); }\n  .📖-page3d .📖-page3d-back {\n    transform: rotateY(-180deg); }\n    .📖-page3d .📖-page3d-back::after {\n      box-shadow: inset -12px 0 12px -12px rgba(0, 0, 0, 0.4); }\n\n@media screen {\n  .📖-viewing .📖-controls {\n    display: block !important; } }\n\n.📖-controls {\n  font: 14px/1.4 -apple-system, BlinkMacSystemFont, \"Roboto\", sans-serif;\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  right: 0;\n  width: 240px;\n  z-index: 999;\n  margin: auto;\n  color: black;\n  background: #f4f4f4;\n  overflow: scroll;\n  padding-bottom: 100px; }\n  .📖-controls * {\n    font: inherit;\n    color: inherit;\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box; }\n\n.📖-title {\n  padding: 20px;\n  font-size: 18px; }\n\n.📖-btn {\n  -webkit-appearance: none;\n  padding: 8px 16px;\n  color: #444;\n  border: none;\n  background: rgba(0, 0, 0, 0.06);\n  cursor: pointer;\n  font-size: 12px;\n  letter-spacing: 0.01em;\n  font-weight: 500;\n  display: inline-block;\n  border-radius: 3px;\n  width: auto;\n  margin-right: 8px; }\n  .📖-btn:focus {\n    outline: none;\n    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); }\n  .📖-btn:hover {\n    background: rgba(0, 0, 0, 0.1); }\n  .📖-btn:active {\n    background: rgba(0, 0, 0, 0.14); }\n\n.📖-btn-light {\n  background: none; }\n\n.📖-btn-main {\n  background: #1b00ff;\n  color: white; }\n  .📖-btn-main:hover {\n    background: #1b00ff;\n    opacity: 0.7; }\n  .📖-btn-main:active {\n    background: black;\n    opacity: 1; }\n\n.📖-in-progress .📖-btn-print {\n  display: none; }\n\n.📖-viewswitcher {\n  padding: 12px 8px;\n  position: fixed;\n  bottom: 0;\n  right: 0;\n  z-index: 99;\n  width: 240px;\n  background: #f4f4f4; }\n\n.📖-viewmode {\n  height: 54px;\n  width: 25%;\n  display: inline-block;\n  text-align: center;\n  font-size: 10px;\n  color: #aaa;\n  cursor: pointer;\n  border-radius: 3px; }\n  .📖-viewmode:hover {\n    background: rgba(0, 0, 0, 0.04); }\n  .📖-viewmode .📖-icon {\n    height: 32px;\n    width: 32px;\n    background: currentColor;\n    margin: 0 auto; }\n  .📖-viewmode.📖-grid .📖-icon {\n    -webkit-mask: url(" + __webpack_require__(46) + ") no-repeat 50% 50%; }\n  .📖-viewmode.📖-flip .📖-icon {\n    -webkit-mask: url(" + __webpack_require__(47) + ") no-repeat 50% 50%; }\n  .📖-viewmode.📖-outline .📖-icon {\n    -webkit-mask: url(" + __webpack_require__(48) + ") no-repeat 50% 50%; }\n  .📖-viewmode.📖-print .📖-icon {\n    -webkit-mask: url(" + __webpack_require__(49) + ") no-repeat 50% 50%; }\n\n[bindery-view-mode='grid'] .📖-grid,\n[bindery-view-mode='interactive'] .📖-flip,\n[bindery-view-mode='outline'] .📖-outline,\n[bindery-view-mode='print'] .📖-print {\n  color: #1b00ff; }\n\n.📖-row {\n  position: relative;\n  display: block;\n  padding: 8px 12px;\n  margin: 4px 8px;\n  cursor: pointer; }\n  .📖-row select {\n    float: right;\n    border: none;\n    background: transparent;\n    padding: 12px;\n    width: 100px; }\n    .📖-row select:hover {\n      background: rgba(0, 0, 0, 0.04); }\n  .📖-row input {\n    width: 85px;\n    padding: 4px 6px 4px 8px;\n    text-align: right;\n    border: none;\n    position: absolute;\n    top: 0;\n    right: 0;\n    height: 100%;\n    width: 100%;\n    color: black;\n    background: none; }\n    .📖-row input:focus {\n      outline: none;\n      background: rgba(0, 0, 0, 0.04); }\n    .📖-row input:invalid {\n      color: #bf5656; }\n\n.📖-row.📖-debug-controls {\n  display: none; }\n  .📖-debug .📖-in-progress .📖-row.📖-debug-controls {\n    display: block; }\n\n.📖-expand-row {\n  color: rgba(0, 0, 0, 0.4);\n  font-weight: 500;\n  border-radius: 4px; }\n  .📖-expand-row:hover {\n    background: rgba(0, 0, 0, 0.04); }\n  .📖-expand-row::after {\n    content: '+';\n    font-size: 1.5em;\n    padding: 0;\n    position: absolute;\n    right: 12px;\n    top: 2px;\n    font-weight: 300; }\n  .📖-expand-row.selected::after {\n    content: '\\2013'; }\n  .📖-expand-row.selected + .📖-expand-area {\n    opacity: 1;\n    max-height: 400px;\n    margin-bottom: 12px; }\n\n.📖-expand-area {\n  opacity: 0;\n  max-height: 0;\n  margin: -4px 8px 0;\n  border-radius: 0 0 4px 4px;\n  transition: max-height 0.3s, margin 0.3s, opacity 0.5s;\n  overflow: hidden; }\n  .📖-expand-area .📖-row {\n    margin: 4px 0; }\n\n.📖-size, .📖-margin {\n  display: inline-block;\n  vertical-align: middle;\n  margin: 0;\n  min-height: 80px;\n  background: white;\n  outline: 1px solid #ddd;\n  height: 100px;\n  width: 100px; }\n\n.📖-size {\n  padding: 8px 0;\n  font-size: 12px; }\n  .📖-size div {\n    position: relative;\n    padding: 6px 12px;\n    color: #aaa; }\n\n.📖-layout-control {\n  margin: 4px 12px 8px; }\n\n.📖-margin {\n  overflow: hidden; }\n  .📖-margin > div {\n    position: absolute;\n    width: 54px;\n    height: 24px;\n    z-index: 5; }\n    .📖-margin > div:hover {\n      z-index: 99; }\n  .📖-margin .top {\n    left: 0;\n    right: 0;\n    margin: auto;\n    top: 0; }\n  .📖-margin .bottom {\n    left: 0;\n    right: 0;\n    margin: auto;\n    bottom: 0; }\n  .📖-margin .inner {\n    left: 0;\n    text-align: left;\n    top: calc(50% - 12px); }\n    .📖-margin .inner input {\n      text-align: left; }\n  .📖-margin .outer {\n    right: 0;\n    text-align: right;\n    top: calc(50% - 12px); }\n    .📖-margin .outer input {\n      text-align: right; }\n  .📖-margin .📖-preview {\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    border: 1px solid #a9a9ff;\n    height: auto;\n    width: auto;\n    z-index: 0;\n    pointer-events: none;\n    transition: border 0.2s; }\n\n.📖-margin input {\n  text-align: center;\n  padding: 4px;\n  font-size: 12px;\n  text-shadow: 0 2px 0 white, 0 -2px 0 white, 2px 0 0 white, -2px 0 0 white; }\n  .📖-margin input:focus {\n    background: none !important; }\n\n.📖-switch {\n  width: 28px;\n  height: 16px;\n  background: rgba(0, 0, 0, 0.2);\n  border-radius: 8px;\n  margin-right: 5px;\n  vertical-align: middle;\n  float: right;\n  transition: all 0.2s;\n  position: relative; }\n  .📖-switch-handle {\n    width: 16px;\n    height: 16px;\n    border-radius: 50%;\n    background: white;\n    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);\n    transition: all 0.2s;\n    position: absolute;\n    left: 0px;\n    top: 0px; }\n  .📖-switch:hover .📖-switch-handle {\n    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3); }\n  .📖-switch:active .📖-switch-handle {\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); }\n\n.📖-row.selected .📖-switch {\n  background: rgba(27, 0, 255, 0.6); }\n\n.📖-row.selected .📖-switch-handle {\n  background: #1b00ff;\n  left: 12px; }\n", ""]);

// exports


/***/ }),
/* 44 */
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
/* 45 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3Cpath id='a' d='M0 4H15V27H0z'/%3E%3Cpath id='b' d='M15 4H30V27H15z'/%3E%3Cpath id='c' d='M14 4.07147535L27 0 27 22.9285247 14 27z'/%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg transform='translate(3 2)'%3E%3Cuse fill='%23FFFFFF' xlink:href='%23a'/%3E%3Cpath stroke='%23000000' d='M0.5 4.5H14.5V26.5H0.5z'/%3E%3C/g%3E%3Cg transform='translate(3 2)'%3E%3Cuse fill='%23FFFFFF' xlink:href='%23b'/%3E%3Cpath stroke='%23000000' d='M15.5 4.5H29.5V26.5H15.5z'/%3E%3C/g%3E%3Cg transform='translate(3 2)'%3E%3Cuse fill='%23FFFFFF' xlink:href='%23c'/%3E%3Cpath stroke='%23000000' d='M14.5,4.43882867 L14.5,26.3194563 L26.5,22.5611713 L26.5,0.680543732 L14.5,4.43882867 Z'/%3E%3C/g%3E%3Cpath fill='%23000000' opacity='.3' d='M16.3241613 26.7071852L25.7154453 22.615177 26.1596848 4.74924377 28 4.30920273 28 27z' transform='translate(3 2)'/%3E%3Ccircle fill='%23000000' cx='11' cy='14' r='1'/%3E%3Ccircle fill='%23000000' cx='11' cy='21' r='1'/%3E%3Cpath d='M28.1793786,11.0743011 C24.667534,11.0743011 21.8206214,13.9212136 21.8206214,17.4330583' stroke='%23000000' transform='rotate(-45 25 14.254)'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 46 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000000' fill='none' fill-rule='evenodd'%3E%3Cpath d='M.5.5H11.5V15.5H.5zM11.5.5H22.5V15.5H11.5z' transform='translate(5 8)'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 47 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000000' fill='none' fill-rule='evenodd'%3E%3Cpath d='M0.5 0.5H11.5V15.5H0.5z' transform='translate(5 8)'/%3E%3Cpath d='M22.5,15.5 L22.5,0.5' stroke-linecap='square' transform='translate(5 8)'/%3E%3Cpath d='M16.5,8.5 L16.5,23.5 L16.9093327,23.5 L24.5,20.6534998 L24.5,5.72150023 L17.1755617,8.46816459 L17,8.5 L16.5,8.5 Z'/%3E%3Cpath d='M27.5 23.5L16.5 23.5M24.5 8.5L27.5 8.5' stroke-linecap='square'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 48 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23000000'%3E%3Cpath d='M.5.5H11.5V15.5H.5zM11.5.5H22.5V15.5H11.5z' transform='translate(5 8)'/%3E%3C/g%3E%3Cpath stroke='%23000000' d='M8.5 13.5H13.5V20.5H8.5z'/%3E%3Cpath fill='%23000000' d='M8 11H14V12H8z'/%3E%3Cpath stroke='%23000000' d='M19.5 13.5H24.5V20.5H19.5z'/%3E%3Cpath fill='%23000000' d='M19 11H25V12H19z'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 49 */
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000000' fill='none' fill-rule='evenodd'%3E%3Cpath d='M4.5 5.5H28.5V24.5H4.5z'/%3E%3Cpath d='M7.5 8.5L9.5 8.5M14.5 8.5L16.5 8.5M14.5 21.5L16.5 21.5M16.5 8.5L18.5 8.5M16.5 21.5L18.5 21.5M23.5 8.5L25.5 8.5M23.5 21.5L25.5 21.5M7.5 21.5L9.5 21.5M7.5 8.5L7.5 10.5M25.5 8.5L25.5 10.5M16.5 8.5L16.5 10.5M7.5 19.5L7.5 21.5M25.5 19.5L25.5 21.5M16.5 19.5L16.5 21.5' stroke-linecap='square'/%3E%3C/g%3E%3C/svg%3E\""

/***/ }),
/* 50 */
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


/***/ })
/******/ ]);
//# sourceMappingURL=bindery.js.map 