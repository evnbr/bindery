/* 📖 Bindery v2.1.0 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Bindery = factory());
}(this, (function () { 'use strict';

var BINDERY_VERSION = 'v2.1.0'

function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);

  return css;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var Book = function () {
  function Book() {
    classCallCheck(this, Book);

    this.pages = [];
    this.queued = [];
    this.isComplete = false;
    this.estimatedProgress = 0;
  }

  createClass(Book, [{
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
      this.estimatedProgress = 1;
      this.queued.forEach(function (func) {
        func();
      });
      this.queued = [];
    }
  }, {
    key: "pageCount",
    get: function get$$1() {
      return this.pages.length;
    }
  }]);
  return Book;
}();

var last = function last(arr) {
  return arr[arr.length - 1];
};

var makeRanges = function makeRanges(arr) {
  var str = '';
  var prevNum = arr[0];
  var isInARange = false;
  arr.forEach(function (num, i) {
    var isLast = i === arr.length - 1;
    var isAdjacent = num === prevNum + 1;

    if (i === 0) {
      str += '' + num;
    } else if (isLast) {
      if (isAdjacent) {
        str += '\u2013' + num;
      } else if (isInARange) {
        str += '\u2013' + prevNum + ', ' + num;
      } else {
        str += ', ' + num;
      }
    } else if (isAdjacent) {
      isInARange = true;
    } else if (isInARange && !isAdjacent) {
      isInARange = false;
      str += '\u2013' + prevNum + ', ' + num;
    } else {
      str += ', ' + num;
    }
    prevNum = num;
  });
  // return `${str} - [${arr}]`;
  return str;
};

var cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;

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

var validate = function validate(opts, validOpts) {
  var isValid = true;
  Object.keys(opts).forEach(function (k) {
    if (!validOpts[k]) {
      console.error('Bindery: \'' + validOpts.name + '\' doesn\'t have property \'' + k + '\'');
      isValid = false;
    } else {
      var val = opts[k];
      var checker = validOpts[k];
      if (!checker(val)) {
        console.error('Bindery: For property \'' + validOpts.name + '.' + k + '\', ' + JSON.stringify(val) + ' is not a valid value of type ' + checker.name);
        isValid = false;
      }
    }
  });
  return isValid;
};

var isObj = function isObj(val) {
  return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
};
var isFunc = function isFunc(val) {
  return typeof val === 'function';
};
var isBool = function isBool(val) {
  return typeof val === 'boolean';
};
var isStr = function isStr(val) {
  return typeof val === 'string';
};
var isArr = function isArr(val) {
  return Array.isArray(val);
};

var OptionType = {
  enum: function _enum() {
    for (var _len = arguments.length, enumCases = Array(_len), _key = 0; _key < _len; _key++) {
      enumCases[_key] = arguments[_key];
    }

    var enumCheck = function enumCheck(str) {
      return enumCases.includes(str);
    };
    Object.defineProperty(enumCheck, 'name', { writable: true });
    enumCheck.name = 'enum ( \'' + enumCases.join('\' | \'') + '\' )';
    return enumCheck;
  },
  any: function any() {
    return true;
  },

  string: isStr,
  length: isValidLength,
  bool: isBool,
  func: isFunc,
  obj: isObj,
  array: isArr,
  shape: function shape(validShape) {
    return function (userShape) {
      return isObj(userShape) && validate(userShape, validShape);
    };
  },

  validate: validate
};

// via https://css-tricks.com/snippets/javascript/get-url-variables/
var urlQuery = (function (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i += 1) {
    var pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
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

// Small utility to create div with namespaced classes
var el = function el(className) {
  var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var div = document.createElement('div');
  div.className = className.split('.').filter(function (txt) {
    return txt !== '';
  }).map(c).join(' ');

  if (typeof content === 'string') {
    div.textContent = content;
  } else if (Array.isArray(content)) {
    content.forEach(function (child) {
      return div.appendChild(child);
    });
  }
  return div;
};

var Page = function () {
  function Page() {
    classCallCheck(this, Page);

    this.flowContent = el('content');
    this.flowBox = el('flowbox', [this.flowContent]);
    this.footer = el('footer');
    this.background = el('background');
    this.element = el('page', [this.background, this.flowBox, this.footer]);
  }

  createClass(Page, [{
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
        this.element.classList.remove(c('right'));
        this.element.classList.add(c('left'));
      } else if (dir === 'right') {
        this.side = dir;
        this.element.classList.remove(c('left'));
        this.element.classList.add(c('right'));
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
    get: function get$$1() {
      return this.suppress || false;
    },
    set: function set$$1(newVal) {
      this.suppress = newVal;
      if (newVal) {
        this.element.classList.add(c('is-overflowing'));
      } else {
        this.element.classList.remove(c('is-overflowing'));
      }
    }
  }, {
    key: 'isEmpty',
    get: function get$$1() {
      return !this.hasOutOfFlowContent && this.flowContent.textContent.trim() === '' && this.flowContent.offsetHeight < 1;
    }
  }, {
    key: 'isLeft',
    get: function get$$1() {
      return this.side === 'left';
    }
  }, {
    key: 'isRight',
    get: function get$$1() {
      return this.side === 'right';
    }
  }], [{
    key: 'isSizeValid',
    value: function isSizeValid() {
      document.body.classList.remove(c('viewing'));

      var testPage = new Page();
      var measureArea = document.querySelector(c('.measure-area'));
      if (!measureArea) measureArea = document.body.appendChild(el('measure-area'));

      measureArea.innerHTML = '';
      measureArea.appendChild(testPage.element);
      var box = testPage.flowBox.getBoundingClientRect();

      measureArea.parentNode.removeChild(measureArea);

      return box.height > 100 && box.width > 100; // TODO: Number is arbitrary
    }
  }]);
  return Page;
}();

// TODO: Combine isSplittable and shouldIgnoreOverflow
// Walk up the tree to see if we are within
// an overflow-ignoring node
var shouldIgnoreOverflow = function shouldIgnoreOverflow(element) {
  if (element.hasAttribute('data-ignore-overflow')) return true;
  if (element.parentElement) return shouldIgnoreOverflow(element.parentElement);
  return false;
};

// When there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent stack overflow
// and browser lockup

var MAX_CALLS = 800;
var MAX_TIME = 50; // ms

var Scheduler = function () {
  function Scheduler() {
    classCallCheck(this, Scheduler);

    this.numberOfCalls = 0;
    this.resumeLimit = Infinity;
    this.callsSinceResume = 0;
    this.queuedFunc = null;
    this.isPaused = false;
    this.useDelay = false;
    this.delayTime = 100;

    this.lastWaitedTime = 0;
  }

  createClass(Scheduler, [{
    key: 'throttle',
    value: function throttle(func) {
      var _this = this;

      this.callsSinceResume += 1;

      if (this.callsSinceResume > this.resumeLimit) {
        this.endResume();
      }

      var handlerTime = performance.now() - this.lastWaitedTime;

      if (this.isPaused) {
        this.queuedFunc = func;
      } else if (this.useDelay) {
        setTimeout(func, this.delayTime);
      } else if (this.numberOfCalls < MAX_CALLS && handlerTime < MAX_TIME) {
        this.numberOfCalls += 1;
        func();
      } else {
        this.numberOfCalls = 0;
        if (document.hidden) {
          // Tab in background
          setTimeout(func, 1);
        } else {
          requestAnimationFrame(function (t) {
            _this.lastWaitedTime = t;
            func();
          });
        }
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
  }, {
    key: 'isDebugging',
    get: function get$$1() {
      return this.useDelay;
    },
    set: function set$$1(newValue) {
      this.useDelay = newValue;
      if (newValue) {
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
  }]);
  return Scheduler;
}();

var scheduler = new Scheduler();

// promise-inspired thenable.
// really just to make callbacks cleaner,
// not guarenteed to be asynchronous.
// (if then and catch aren't registered yet,
// it waits until they are).

var Thenable = function () {
  function Thenable(func) {
    classCallCheck(this, Thenable);

    this.successArgs = [];
    this.errorArgs = [];

    this.successCallback = null;
    this.errorCallback = null;
    this.progressCallback = null;

    this.chainedThenable = null;
    this.chainedSuccessCallback = null;
    this.chainedErrorCallback = null;

    this.isRejected = false;
    this.isResolved = false;

    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.updateProgress = this.updateProgress.bind(this);

    if (func) func(this.resolve, this.reject, this.updateProgress);
  }

  createClass(Thenable, [{
    key: 'then',
    value: function then(func) {
      if (this.chainedThenable) {
        return this.chainedThenable.then(func);
      }

      if (!this.successCallback) {
        this.successCallback = func;
        if (this.isResolved) this.resolve();
        return this;
      } else if (!this.chainedSuccessCallback) {
        this.chainedSuccessCallback = func;
        if (this.isResolved) this.resolveChained();
        // console.log('attached chained then');
        return this;
      }
      throw Error('need real chained then');
    }
  }, {
    key: 'progress',
    value: function progress(func) {
      this.progressCallback = func;
      return this;
    }
  }, {
    key: 'catch',
    value: function _catch(func) {
      if (this.chainedThenable) {
        return this.chainedThenable.catch(func);
      }

      if (!this.errorCallback) {
        this.errorCallback = func;
        if (this.isRejected) this.reject();
        return this;
      } else if (!this.chainedErrorCallback) {
        this.chainedErrorCallback = func;
        if (this.isRejected) this.rejectChained();
        // console.log('attached chained error');
        return this;
      }
      throw Error('need real chained catch');
    }
  }, {
    key: 'resolve',
    value: function resolve() {
      this.isResolved = true;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length > 0) this.successArgs = args;
      if (this.successCallback !== null) {
        // console.log('applying then');
        var result = void 0;
        if (this.successArgs.length > 0) {
          result = this.successCallback.apply(this, toConsumableArray(this.successArgs));
        } else {
          result = this.successCallback();
        }
        if (result && result.then) this.chainedThenable = result;
        if (this.chainedSuccessCallback) this.resolveChained();
      } else {
        // console.log('waiting for then');
      }
    }
  }, {
    key: 'resolveChained',
    value: function resolveChained() {
      if (this.chainedThenable) this.chainedThenable.then(this.chainedSuccessCallback);else this.chainedSuccessCallback();
    }
  }, {
    key: 'reject',
    value: function reject() {
      this.isRejected = true;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (args.length > 0) this.errorArgs = args;
      if (this.errorCallback !== null) {
        // console.log('applying catch');
        var result = void 0;
        if (this.errorArgs.length > 0) {
          result = this.errorCallback.apply(this, toConsumableArray(this.errorArgs));
        } else {
          result = this.errorCallback();
        }
        if (result && result.then) {
          this.chainedThenable = result;
        }
        if (this.successCallback) {
          if (result && result.then) {
            // console.log('forwarded unused then');
            result.then(this.successCallback);
          }
        }
        if (this.chainedSuccessCallback) {
          if (result && result.then) {
            // console.log('forwarded chained then');
            result.then(this.chainedSuccessCallback);
          } else this.chainedSuccessCallback();
        }
        if (this.chainedErrorCallback) this.rejectChained();
      } else {
        // console.log('waiting for catch');
      }
    }
  }, {
    key: 'rejectChained',
    value: function rejectChained() {
      if (this.chainedThenable) this.chainedThenable.catch(this.chainedErrorCallback);else this.chainedErrorCallback();
    }
  }, {
    key: 'updateProgress',
    value: function updateProgress() {
      if (this.progressCallback !== null) {
        this.progressCallback.apply(this, arguments);
      }
    }
  }], [{
    key: 'resolved',
    value: function resolved() {
      return new Thenable(function (resolve) {
        return resolve();
      });
    }
  }]);
  return Thenable;
}();

// Try adding a text node in one go
var addTextNode = function addTextNode(textNode, parent, page) {
  return new Thenable(function (resolve, reject) {
    parent.appendChild(textNode);

    if (page.hasOverflowed()) {
      parent.removeChild(textNode);
      scheduler.throttle(reject);
    } else {
      scheduler.throttle(resolve);
    }
  });
};

// Try adding a text node by incrementally adding words
// until it just barely doesnt overflow.
// Binary search would probably be better but its not currenty
// the bottleneck.
var addTextNodeIncremental = function addTextNodeIncremental(textNode, parent, page) {
  return new Thenable(function (resolve, reject) {
    var originalText = textNode.nodeValue;
    parent.appendChild(textNode);

    if (!page.hasOverflowed() || shouldIgnoreOverflow(parent)) {
      scheduler.throttle(resolve);
      return;
    }

    var pos = 0;

    var splitTextStep = function splitTextStep() {
      textNode.nodeValue = originalText.substr(0, pos);

      if (page.hasOverflowed()) {
        // Back out to word boundary
        if (originalText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
        while (originalText.charAt(pos) !== ' ' && pos > 0) {
          pos -= 1;
        }if (pos < 1) {
          textNode.nodeValue = originalText;
          textNode.parentNode.removeChild(textNode);
          scheduler.throttle(reject);
          return;
        }

        // console.log(`Text breaks at ${pos}: ${originalText.substr(0, pos)}`);

        var fittingText = originalText.substr(0, pos);
        var overflowingText = originalText.substr(pos);
        textNode.nodeValue = fittingText;

        // Start on new page
        var remainingTextNode = document.createTextNode(overflowingText);
        scheduler.throttle(function () {
          return resolve(remainingTextNode);
        });
        return;
      }
      if (pos > originalText.length - 1) {
        scheduler.throttle(resolve);
        return;
      }

      pos += 1;
      while (originalText.charAt(pos) !== ' ' && pos < originalText.length) {
        pos += 1;
      }scheduler.throttle(splitTextStep);
    };

    splitTextStep();
  });
};

var Rule = function Rule(options) {
  var _this = this;

  classCallCheck(this, Rule);

  this.name = options.name ? options.name : 'Unnamed Bindery Rule';
  this.selector = '';

  Object.keys(options).forEach(function (key) {
    _this[key] = options[key];
  });
};

var OutOfFlow = function (_Rule) {
  inherits(OutOfFlow, _Rule);

  function OutOfFlow(options) {
    classCallCheck(this, OutOfFlow);

    var _this = possibleConstructorReturn(this, (OutOfFlow.__proto__ || Object.getPrototypeOf(OutOfFlow)).call(this, options));

    _this.name = 'Out of Flow';
    return _this;
  }

  createClass(OutOfFlow, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt) {
      // Avoid breaking inside this element. Once it's completely added,
      // it will moved onto the background layer.

      elmt.setAttribute('data-ignore-overflow', true);
      return elmt;
    }
  }, {
    key: 'afterAdd',
    value: function afterAdd(elmt, book, continueOnNewPage, makeNewPage) {
      this.createOutOfFlowPages(elmt, book, makeNewPage);

      // Catches cases when we didn't need to create a new page. but unclear
      if (this.continue !== 'same' || book.pageInProgress.hasOutOfFlowContent) {
        continueOnNewPage(true);
        if (this.continue === 'left' || this.continue === 'right') {
          book.pageInProgress.setPreference(this.continue);
        }
      }

      return elmt;
    }
  }]);
  return OutOfFlow;
}(Rule);

// Options:
// selector: String

var FullBleedPage = function (_OutOfFlow) {
  inherits(FullBleedPage, _OutOfFlow);

  function FullBleedPage(options) {
    classCallCheck(this, FullBleedPage);

    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';

    var _this = possibleConstructorReturn(this, (FullBleedPage.__proto__ || Object.getPrototypeOf(FullBleedPage)).call(this, options));

    OptionType.validate(options, {
      name: 'FullBleedPage',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'same', 'left', 'right'),
      rotate: OptionType.enum('none', 'inward', 'outward', 'clockwise', 'counterclockwise')
    });
    return _this;
  }

  createClass(FullBleedPage, [{
    key: 'createOutOfFlowPages',
    value: function createOutOfFlowPages(elmt, book, makeNewPage) {
      elmt.parentNode.removeChild(elmt);

      var newPage = void 0;
      if (book.pageInProgress.isEmpty) {
        newPage = book.pageInProgress;
      } else {
        newPage = makeNewPage();
        book.pages.push(newPage);
      }
      if (this.rotate !== 'none') {
        var rotateContainer = el('.rotate-container.page-size-rotated.rotate-' + this.rotate);
        rotateContainer.appendChild(newPage.background);
        newPage.element.appendChild(rotateContainer);
      }
      newPage.background.appendChild(elmt);
      newPage.hasOutOfFlowContent = true;
    }
  }]);
  return FullBleedPage;
}(OutOfFlow);

// Options:
// selector: String

var FullBleedSpread = function (_OutOfFlow) {
  inherits(FullBleedSpread, _OutOfFlow);

  function FullBleedSpread(options) {
    classCallCheck(this, FullBleedSpread);

    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';

    var _this = possibleConstructorReturn(this, (FullBleedSpread.__proto__ || Object.getPrototypeOf(FullBleedSpread)).call(this, options));

    OptionType.validate(options, {
      name: 'FullBleedSpread',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'same', 'left', 'right'),
      rotate: OptionType.enum('none', 'clockwise', 'counterclockwise')
    });
    return _this;
  }

  createClass(FullBleedSpread, [{
    key: 'createOutOfFlowPages',
    value: function createOutOfFlowPages(elmt, book, makeNewPage) {
      var _this2 = this;

      elmt.parentNode.removeChild(elmt);

      var leftPage = void 0;
      if (book.pageInProgress.isEmpty) {
        leftPage = book.pageInProgress;
      } else {
        leftPage = makeNewPage();
        book.pages.push(leftPage);
      }

      var rightPage = makeNewPage();
      book.pages.push(rightPage);

      if (this.rotate !== 'none') {
        [leftPage, rightPage].forEach(function (page) {
          var rotateContainer = el('.rotate-container.spread-size-rotated.rotate-spread-' + _this2.rotate);
          rotateContainer.appendChild(page.background);
          page.element.appendChild(rotateContainer);
        });
      }

      leftPage.background.appendChild(elmt);
      leftPage.element.classList.add(c('spread'));
      leftPage.setPreference('left');
      leftPage.isOutOfFlow = this.continue === 'same';
      leftPage.hasOutOfFlowContent = true;

      rightPage.background.appendChild(elmt.cloneNode(true));
      rightPage.element.classList.add(c('spread'));
      rightPage.setPreference('right');
      rightPage.isOutOfFlow = this.continue === 'same';
      rightPage.hasOutOfFlowContent = true;
    }
  }]);
  return FullBleedSpread;
}(OutOfFlow);

var PageBreak = function (_Rule) {
  inherits(PageBreak, _Rule);

  function PageBreak(options) {
    classCallCheck(this, PageBreak);

    options.position = options.position || 'before';
    options.continue = options.continue || 'next';

    var _this = possibleConstructorReturn(this, (PageBreak.__proto__ || Object.getPrototypeOf(PageBreak)).call(this, options));

    OptionType.validate(options, {
      name: 'PageBreak',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'left', 'right'),
      position: OptionType.enum('before', 'after', 'both', 'avoid')
    });
    return _this;
  }

  createClass(PageBreak, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt, book, continueOnNewPage) {
      if (this.position === 'before' || this.position === 'both') {
        if (!book.pageInProgress.isEmpty) {
          continueOnNewPage();
        }
        if (this.continue !== 'next') {
          book.pageInProgress.setPreference(this.continue);
        }
      }
      return elmt;
    }
  }, {
    key: 'afterAdd',
    value: function afterAdd(elmt, book, continueOnNewPage) {
      if (this.position === 'after' || this.position === 'both') {
        var newPage = continueOnNewPage(true);
        if (this.continue !== 'next') {
          newPage.setPreference(this.continue);
        }
      }
      return elmt;
    }
  }, {
    key: 'avoidSplit',
    get: function get$$1() {
      return this.position === 'avoid';
    }
  }]);
  return PageBreak;
}(Rule);

var elementToString = function elementToString(node) {
  var tag = node.tagName.toLowerCase();
  var id = node.id ? '#' + node.id : '';

  var classes = '';
  if (node.classList.length > 0) {
    classes = '.' + [].concat(toConsumableArray(node.classList)).join('.');
  }

  var text = '';
  if (id.length < 1 && classes.length < 2) {
    text = '("' + node.textContent.substr(0, 30).replace(/\s+/g, ' ') + '...")';
  }
  return tag + id + classes + text;
};

var isFullPageRule = function isFullPageRule(rule) {
  return rule instanceof FullBleedSpread || rule instanceof FullBleedPage || rule instanceof PageBreak;
};

var dedupe = function dedupe(inputRules) {
  var conflictRules = inputRules.filter(isFullPageRule);
  var uniqueRules = inputRules.filter(function (rule) {
    return !conflictRules.includes(rule);
  });

  var firstSpreadRule = conflictRules.find(function (rule) {
    return rule instanceof FullBleedSpread;
  });
  var firstPageRule = conflictRules.find(function (rule) {
    return rule instanceof FullBleedPage;
  });

  // Only apply one fullpage or fullspread
  if (firstSpreadRule) uniqueRules.push(firstSpreadRule);else if (firstPageRule) uniqueRules.push(firstPageRule);else uniqueRules.push.apply(uniqueRules, toConsumableArray(conflictRules)); // multiple pagebreaks are ok

  return uniqueRules;
};

var RuleSet = function () {
  function RuleSet(rules) {
    classCallCheck(this, RuleSet);

    this.rules = rules;
    this.pageRules = rules.filter(function (r) {
      return r.eachPage;
    });
    this.beforeAddRules = rules.filter(function (r) {
      return r.selector && r.beforeAdd;
    });
    this.afterAddRules = rules.filter(function (r) {
      return r.selector && r.afterAdd;
    });
    this.selectorsNotToSplit = rules.filter(function (rule) {
      return rule.avoidSplit;
    }).map(function (rule) {
      return rule.selector;
    });
  }

  createClass(RuleSet, [{
    key: 'setup',
    value: function setup() {
      this.rules.forEach(function (rule) {
        if (rule.setup) rule.setup();
      });
    }
  }, {
    key: 'startPage',
    value: function startPage(pg, book) {
      this.rules.forEach(function (rule) {
        if (rule.afterPageCreated) rule.afterPageCreated(pg, book);
      });
    }
  }, {
    key: 'finishEveryPage',
    value: function finishEveryPage(book) {
      this.pageRules.forEach(function (rule) {
        book.pages.forEach(function (page) {
          rule.eachPage(page, book);
        });
      });
    }
  }, {
    key: 'finishPage',
    value: function finishPage(page, book) {
      this.pageRules.forEach(function (rule) {
        rule.eachPage(page, book);
      });
    }
  }, {
    key: 'beforeAddElement',
    value: function beforeAddElement(element, book, continueOnNewPage, makeNewPage) {
      var addedElement = element;

      var matchingRules = this.beforeAddRules.filter(function (rule) {
        return addedElement.matches(rule.selector);
      });
      // const uniqueRules = dedupeRules(matchingRules);

      matchingRules.forEach(function (rule) {
        addedElement = rule.beforeAdd(addedElement, book, continueOnNewPage, makeNewPage);
      });
      return addedElement;
    }
  }, {
    key: 'afterAddElement',
    value: function afterAddElement(originalElement, book, continueOnNewPage, makeNewPage, moveToNext) {
      var addedElement = originalElement;

      var matchingRules = this.afterAddRules.filter(function (rule) {
        return addedElement.matches(rule.selector);
      });
      var uniqueRules = dedupe(matchingRules);

      // TODO:
      // While this does catch overflows, it introduces a few new bugs.
      // It is pretty aggressive to move the entire node to the next page.
      // - 1. there is no guarentee it will fit on the new page
      // - 2. if it has childNodes, those side effects will not be undone,
      // which means footnotes will get left on previous page.
      // - 3. if it is a large paragraph, it will leave a large gap. the
      // ideal approach would be to only need to invalidate
      // the last line of text.

      uniqueRules.forEach(function (rule) {
        addedElement = rule.afterAdd(addedElement, book, continueOnNewPage, makeNewPage, function (problemElement) {
          moveToNext(problemElement);
          return rule.afterAdd(problemElement, book, continueOnNewPage, makeNewPage, function () {
            console.log('Couldn\'t apply ' + rule.name + ' to ' + elementToString(problemElement) + '. Caused overflows twice.');
          });
        });
      });
      return addedElement;
    }
  }]);
  return RuleSet;
}();

var indexOfNextInFlowPage = function indexOfNextInFlowPage(pages, startIndex) {
  for (var i = startIndex; i < pages.length; i += 1) {
    if (!pages[i].isOutOfFlow) {
      return i;
    }
  }
  return startIndex;
};

// Given an array of pages with alwaysLeft, alwaysRight, and isOutOfFlow
// properties.
//
// Orders them so that alwaysLeft and alwaysRight are true.

// If the page is 'in flow', order must be respected, so extra blank pages
// are inserted.
//
// If the page is 'out of flow', we'd prefer not to add a blank page.
// Instead it floats backwards in the book, pulling the next
// in-flow page forward. If several 'out of flow' pages
// are next to each other, they will remain in order, all being pushed
// backward together.


var orderPages = function orderPages(pages, makeNewPage) {
  var orderedPages = pages.slice();

  for (var i = 0; i < orderedPages.length; i += 1) {
    var page = orderedPages[i];
    var isLeft = i % 2 !== 0;

    if (isLeft && page.alwaysRight || !isLeft && page.alwaysLeft) {
      if (page.isOutOfFlow) {
        var indexToSwap = indexOfNextInFlowPage(orderedPages, i + 1);
        var pageToMoveUp = orderedPages[indexToSwap];
        orderedPages.splice(indexToSwap, 1);
        orderedPages.splice(i, 0, pageToMoveUp);
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    }
  }
  return orderedPages;
};

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
// The transition can be customized by setting a Split rule,
// which lets you add classes to the original and cloned element
// to customize styling.

var breadcrumbClone = function breadcrumbClone(origBreadcrumb, rules) {
  var newBreadcrumb = [];

  // TODO check if element actually matches
  var toNextClasses = rules.filter(function (rule) {
    return rule.customToNextClass;
  }).map(function (rule) {
    return rule.customToNextClass;
  });
  var fromPrevClasses = rules.filter(function (rule) {
    return rule.customFromPreviousClass;
  }).map(function (rule) {
    return rule.customFromPreviousClass;
  });

  var markAsToNext = function markAsToNext(node) {
    node.classList.add(c('continues'));
    toNextClasses.forEach(function (cl) {
      return node.classList.add(cl);
    });
  };

  var markAsFromPrev = function markAsFromPrev(node) {
    node.classList.add(c('continuation'));
    fromPrevClasses.forEach(function (cl) {
      return node.classList.add(cl);
    });
  };

  for (var i = origBreadcrumb.length - 1; i >= 0; i -= 1) {
    var original = origBreadcrumb[i];
    var clone = original.cloneNode(false); // shallow
    clone.innerHTML = '';

    markAsToNext(original);
    markAsFromPrev(clone);

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

// Note: Doesn't ever reject, since missing images
// shouldn't prevent layout from resolving

var waitForImage = function waitForImage(image) {
  return new Thenable(function (resolve) {
    var pollForSize = setInterval(function () {
      if (image.naturalWidth) {
        clearInterval(pollForSize);
        resolve();
      }
    }, 10);

    image.addEventListener('error', function () {
      clearInterval(pollForSize);
      resolve();
    });
    image.src = image.src;
  });
};

// Bindery
// paginate
// Utils
var MAXIMUM_PAGE_LIMIT = 2000;

var isTextNode = function isTextNode(node) {
  return node.nodeType === Node.TEXT_NODE;
};
var isElement = function isElement(node) {
  return node.nodeType === Node.ELEMENT_NODE;
};
var isScript = function isScript(node) {
  return node.tagName === 'SCRIPT';
};
var isImage = function isImage(node) {
  return node.tagName === 'IMG';
};
var isUnloadedImage = function isUnloadedImage(node) {
  return isImage(node) && !node.naturalWidth;
};
var isContent = function isContent(node) {
  return isElement(node) && !isScript(node);
};

var sec = function sec(ms) {
  return (ms / 1000).toFixed(2);
};

// Walk up the tree to see if we can safely
// insert a split into this node.
var isSplittable = function isSplittable(element, selectorsNotToSplit) {
  if (selectorsNotToSplit.some(function (sel) {
    return element.matches(sel);
  })) {
    if (element.hasAttribute('data-bindery-did-move') || element.classList.contains(c('continuation'))) {
      return true; // ignore rules and split it anyways.
    }
    return false;
  }
  if (element.parentElement) {
    return isSplittable(element.parentElement, selectorsNotToSplit);
  }
  return true;
};

var paginate$1 = function paginate(content, rules) {
  return new Thenable(function (paginateResolve, paginateReject, progress) {
    // SETUP
    var layoutWaitingTime = 0;
    var elementCount = 0;
    var elementsProcessed = 0;

    var ruleSet = new RuleSet(rules);
    var measureArea = document.body.appendChild(el('.measure-area'));

    var breadcrumb = []; // Keep track of position in original tree
    var book = new Book();

    var canSplit = function canSplit() {
      return !shouldIgnoreOverflow(last(breadcrumb));
    };

    var makeNewPage = function makeNewPage() {
      var newPage = new Page();
      measureArea.appendChild(newPage.element);

      ruleSet.startPage(newPage, book);
      return newPage;
    };

    var finishPage = function finishPage(page, ignoreOverflow) {
      if (page && page.hasOverflowed()) {
        console.warn('Bindery: Page overflowing', book.pageInProgress.element);
        if (!page.suppressErrors && !ignoreOverflow) {
          paginateReject('Moved to new page when last one is still overflowing');
          throw Error('Bindery: Moved to new page when last one is still overflowing');
        }
      }

      // finished with this page, can display
      book.pages = orderPages(book.pages, makeNewPage);
      annotatePages(book.pages);
      if (page) ruleSet.finishPage(page, book);
    };

    // Creates clones for ever level of tag
    // we were in when we overflowed the last page
    var continueOnNewPage = function continueOnNewPage() {
      var ignoreOverflow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (book.pages.length > MAXIMUM_PAGE_LIMIT) {
        paginateReject('Maximum page count exceeded');
        throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
      }

      finishPage(book.pageInProgress, ignoreOverflow);

      breadcrumb = breadcrumbClone(breadcrumb, rules);
      var newPage = makeNewPage();

      book.pageInProgress = newPage;
      progress(book);

      book.pages.push(newPage);

      if (breadcrumb[0]) {
        newPage.flowContent.appendChild(breadcrumb[0]);
      }

      // make sure the cloned page is valid.
      if (newPage.hasOverflowed()) {
        var suspect = last(breadcrumb);
        if (suspect) {
          console.warn('Bindery: Content overflows, probably due to a style set on ' + elementToString(suspect) + '.');
          suspect.parentNode.removeChild(suspect);
        } else {
          console.warn('Bindery: Content overflows.');
        }
      }

      return newPage;
    };

    // Shifts this element to the next page. If any of its
    // ancestors cannot be split across page, it will
    // step up the tree to find the first ancestor
    // that can be split, and move all of that descendants
    // to the next page.
    var moveElementToNextPage = function moveElementToNextPage(nodeToMove) {
      // So this node won't get cloned. TODO: this is unclear
      breadcrumb.pop();

      if (breadcrumb.length < 1) {
        throw Error('Bindery: Attempting to move the top-level element');
      }

      // find the nearest splittable parent
      var willMove = nodeToMove;
      var pathToRestore = [];
      while (breadcrumb.length > 1 && !isSplittable(last(breadcrumb), ruleSet.selectorsNotToSplit)) {
        // console.log('Not OK to split:', last(breadcrumb));
        willMove = breadcrumb.pop();
        pathToRestore.unshift(willMove);
      }

      // Once a node is moved to a new page, it should no longer trigger another
      // move. otherwise tall elements will endlessly get shifted to the next page
      willMove.setAttribute('data-bindery-did-move', true);

      var parent = willMove.parentNode;
      parent.removeChild(willMove);

      if (breadcrumb.length > 1 && last(breadcrumb).textContent.trim() === '') {
        parent.appendChild(willMove);
        willMove = breadcrumb.pop();
        pathToRestore.unshift(willMove);
        willMove.parentNode.removeChild(willMove);
      }

      // If the page is empty when this node is removed,
      // then it won't help to move it to the next page.
      // Instead continue here until the node is done.
      if (!book.pageInProgress.isEmpty) {
        if (book.pageInProgress.hasOverflowed()) {
          book.pageInProgress.suppressErrors = true;
        }
        continueOnNewPage();
      }

      // append node as first in new page
      last(breadcrumb).appendChild(willMove);

      // restore subpath
      pathToRestore.forEach(function (restore) {
        breadcrumb.push(restore);
      });

      breadcrumb.push(nodeToMove);
    };

    var addTextWithoutChecks = function addTextWithoutChecks(child, parent) {
      return new Thenable(function (resolve) {
        parent.appendChild(child);
        if (canSplit()) {
          book.pageInProgress.suppressErrors = true;
          continueOnNewPage();
        }
        resolve();
      });
    };

    var addSplittableText = function addSplittableText(text) {
      return new Thenable(function (resolve, reject) {
        addTextNodeIncremental(text, last(breadcrumb), book.pageInProgress).then(function (remainder) {
          if (remainder) {
            continueOnNewPage();
            addSplittableText(remainder).then(resolve).catch(reject);
          } else {
            resolve();
          }
        }).catch(reject);
      });
    };

    var canSplitParent = function canSplitParent(parent) {
      return isSplittable(parent, ruleSet.selectorsNotToSplit) && !shouldIgnoreOverflow(parent);
    };

    var addTextChild = function addTextChild(child, parent) {
      return (canSplitParent(parent) ? addSplittableText(child).catch(function () {
        if (breadcrumb.length < 2) return addTextWithoutChecks(child, last(breadcrumb));
        moveElementToNextPage(parent);
        return addSplittableText(child);
      }) : addTextNode(child, last(breadcrumb), book.pageInProgress).catch(function () {
        if (canSplit()) moveElementToNextPage(parent);
        return addTextNode(child, last(breadcrumb), book.pageInProgress);
      })).catch(function () {
        return addTextWithoutChecks(child, last(breadcrumb));
      });
    };

    var addElementNode = void 0;

    var addChild = function addChild(child, parent) {
      if (isTextNode(child)) {
        return addTextChild(child, parent);
      } else if (isUnloadedImage(child)) {
        var imgStart = performance.now();
        return waitForImage(child).then(function () {
          layoutWaitingTime += performance.now() - imgStart;
          return addElementNode(child);
        });
      } else if (isContent(child)) {
        return addElementNode(child);
      }

      // Skip comments and unknown nodes
      return Thenable.resolved();
    };

    // Adds an element node by clearing its childNodes, then inserting them
    // one by one recursively until thet overflow the page
    addElementNode = function addElementNode(elementToAdd) {
      return new Thenable(function (resolve) {
        if (book.pageInProgress.hasOverflowed() && canSplit()) {
          book.pageInProgress.suppressErrors = true;
          continueOnNewPage();
        }
        var element = ruleSet.beforeAddElement(elementToAdd, book, continueOnNewPage, makeNewPage);

        if (!breadcrumb[0]) book.pageInProgress.flowContent.appendChild(element);else last(breadcrumb).appendChild(element);

        breadcrumb.push(element);

        var childNodes = [].concat(toConsumableArray(element.childNodes));
        element.innerHTML = '';

        // Overflows when empty
        if (book.pageInProgress.hasOverflowed() && canSplit()) {
          moveElementToNextPage(element);
        }

        var finishAdding = function finishAdding() {
          // We're now done with this element and its children,
          // so we pop up a level
          var addedChild = breadcrumb.pop();
          ruleSet.afterAddElement(addedChild, book, continueOnNewPage, makeNewPage, function (el) {
            el.parentNode.removeChild(el);
            continueOnNewPage();
            last(breadcrumb).appendChild(el);
          });
          elementsProcessed += 1;
          book.estimatedProgress = elementsProcessed / elementCount;
          resolve();
        };

        var index = 0;
        var addNext = function addNext() {
          if (index < childNodes.length) {
            var child = childNodes[index];
            index += 1;
            addChild(child, element).then(addNext);
          } else {
            finishAdding();
          }
        };

        // kick it off
        addNext();
      });
    };

    (function () {
      var startLayoutTime = window.performance.now();

      ruleSet.setup();
      content.style.margin = 0;
      content.style.padding = 0;
      elementCount = content.querySelectorAll('*').length;
      continueOnNewPage();
      addElementNode(content).then(function () {
        document.body.removeChild(measureArea);

        book.pages = orderPages(book.pages, makeNewPage);
        annotatePages(book.pages);

        book.setCompleted();
        ruleSet.finishEveryPage(book);

        var endLayoutTime = window.performance.now();
        var totalTime = endLayoutTime - startLayoutTime;
        var layoutTime = totalTime - layoutWaitingTime;

        console.log('\uD83D\uDCD6 Book ready in ' + sec(totalTime) + 's (Layout: ' + sec(layoutTime) + 's, Waiting for images: ' + sec(layoutWaitingTime) + 's)');

        paginateResolve(book);
      });
    })();
  });
};

var Mode = Object.freeze({
  FLIPBOOK: 'view_flipbook',
  PREVIEW: 'view_preview',
  PRINT: 'view_print'
});

var Paper = Object.freeze({
  AUTO: 'paper_auto',
  AUTO_BLEED: 'paper_auto_bleed',
  AUTO_MARKS: 'paper_auto_marks',
  LETTER_PORTRAIT: 'paper_letter_p',
  LETTER_LANDSCAPE: 'paper_letter_l',
  A4_PORTRAIT: 'paper_a4_p',
  A4_LANDSCAPE: 'paper_a4_l'
});

var Layout = Object.freeze({
  PAGES: 'layout_pages',
  SPREADS: 'layout_spreads',
  BOOKLET: 'layout_booklet'
});

var Marks = Object.freeze({
  NONE: 'marks_none',
  SPREADS: 'layout_spreads',
  BOTH: 'marks_both'
});

var letter = { width: '8.5in', height: '11in' };
var a4 = { width: '210mm', height: '297mm' };
var defaultPageSetup = {
  bleed: '12pt',
  size: { width: '4in', height: '6in' },
  margin: {
    inner: '24pt',
    outer: '24pt',
    bottom: '40pt',
    top: '48pt'
  }
};

var supportsCustomPageSize = !!window.chrome && !!window.chrome.webstore;

var PageSetup = function () {
  function PageSetup() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, PageSetup);

    this.setSize(opts.size || defaultPageSetup.size);
    this.setMargin(opts.margin || defaultPageSetup.margin);
    this.setBleed(opts.bleed || defaultPageSetup.bleed);
  }

  createClass(PageSetup, [{
    key: 'setupPaper',
    value: function setupPaper() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.sheetSizeMode = supportsCustomPageSize ? opts.paper || Paper.AUTO : Paper.AUTO_MARKS;
      this.printTwoUp = opts.layout && opts.layout !== Layout.PAGES;
    }
  }, {
    key: 'setSize',
    value: function setSize(size) {
      isValidSize(size);
      this.size = size;
    }
  }, {
    key: 'setMargin',
    value: function setMargin(margin) {
      isValidSize(margin);
      this.margin = margin;
    }
  }, {
    key: 'setBleed',
    value: function setBleed(newBleed) {
      this.bleed = newBleed;
    }
  }, {
    key: 'setPrintTwoUp',
    value: function setPrintTwoUp(newVal) {
      this.printTwoUp = newVal;
    }
  }, {
    key: 'isSizeValid',
    value: function isSizeValid() {
      this.updateStylesheet();
      return Page.isSizeValid();
    }
  }, {
    key: 'spreadSizeStyle',
    value: function spreadSizeStyle() {
      var w = parseVal(this.size.width);
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
      var w = parseVal(this.size.width);

      sheet.innerHTML = '\n@page { size: ' + this.sheetSize.width + ' ' + this.sheetSize.height + '; }\n' + c('.print-page') + ' { width: ' + this.sheetSize.width + '; height: ' + this.sheetSize.height + ';}\n\n' + c('.show-crop') + ' ' + c('.print-page') + ' ' + c('.spread-wrapper') + ',\n' + c('.show-bleed-marks') + ' ' + c('.print-page') + ' ' + c('.spread-wrapper') + ' {\n  margin: calc(' + this.bleed + ' + 12pt) auto;\n}\nhtml {\n  --bindery-page-width: ' + this.size.width + ';\n  --bindery-page-height: ' + this.size.height + ';\n}\n' + c('.page-size-rotated') + ' {\n  height: ' + this.size.width + ';\n  width: ' + this.size.height + ';\n}\n' + c('.spread-size') + ' {\n  height: ' + this.size.height + ';\n  width: ' + w.val * 2 + w.unit + ';\n}\n' + c('.spread-size-rotated') + ' {\n  height: ' + w.val * 2 + w.unit + ';\n  width: ' + this.size.height + ';\n}\n' + c('.flowbox') + ',\n' + c('.footer') + ' {\n  margin-left: ' + this.margin.inner + ';\n  margin-right: ' + this.margin.outer + ';\n}\n' + c('.left') + ' ' + c('.flowbox') + ',\n' + c('.left') + ' ' + c('.footer') + ' {\n  margin-left: ' + this.margin.outer + ';\n  margin-right: ' + this.margin.inner + ';\n}\n\n' + c('.left') + ' ' + c('.running-header') + ' {\n  left: ' + this.margin.outer + ';\n}\n' + c('.right') + ' ' + c('.running-header') + ' {\n  right: ' + this.margin.outer + ';\n}\n\n' + c('.flowbox') + ' { margin-top: ' + this.margin.top + '; }\n' + c('.footer') + '{ margin-bottom: ' + this.margin.bottom + '; }\n\n' + c('.bleed-left') + ',\n' + c('.bleed-right') + ',\n' + c('.crop-left') + ',\n' + c('.crop-right') + ',\n' + c('.crop-fold') + ' {\n  top: calc( -12pt - ' + this.bleed + ' );\n  bottom: calc( -12pt - ' + this.bleed + ' );\n}\n\n' + c('.bleed-top') + ',\n' + c('.bleed-bottom') + ',\n' + c('.crop-top') + ',\n' + c('.crop-bottom') + ' {\n  left: calc( -12pt - ' + this.bleed + ' );\n  right: calc( -12pt - ' + this.bleed + ' );\n}\n' + c('.bleed-left') + '   { left: -' + this.bleed + '; }\n' + c('.bleed-right') + '  { right: -' + this.bleed + '; }\n' + c('.bleed-top') + '    { top: -' + this.bleed + '; }\n' + c('.bleed-bottom') + ' { bottom: -' + this.bleed + '; }\n\n' + c('.background') + ' {\n  top: -' + this.bleed + ';\n  bottom: -' + this.bleed + ';\n  left: -' + this.bleed + ';\n  right: -' + this.bleed + ';\n}\n\n' + c('.spread') + c('.right') + ' > ' + c('.background') + ' {\n  left: calc(-100% - ' + this.bleed + ');\n}\n' + c('.spread') + c('.left') + ' > ' + c('.background') + ' {\n  right: calc(-100% - ' + this.bleed + ');\n}\n    ';
      document.head.appendChild(sheet);
    }
  }, {
    key: 'displaySize',
    get: function get$$1() {
      var width = this.printTwoUp ? this.spreadSizeStyle().width : this.size.width;
      var height = this.size.height;
      var bleed = this.bleed;

      return {
        width: width,
        height: height,
        bleed: bleed
      };
    }
  }, {
    key: 'sheetSize',
    get: function get$$1() {
      var width = this.printTwoUp ? this.spreadSizeStyle().width : this.size.width;
      var height = this.size.height;
      var b = this.bleed;

      switch (this.sheetSizeMode) {
        case Paper.AUTO:
          return { width: width, height: height };
        case Paper.AUTO_BLEED:
          return {
            width: 'calc(' + width + ' + ' + b + ' + ' + b + ')',
            height: 'calc(' + height + ' + ' + b + ' + ' + b + ')'
          };
        case Paper.AUTO_MARKS:
          // TODO: 24pt marks is hardcoded
          return {
            width: 'calc(' + width + ' + ' + b + ' + ' + b + ' + 24pt)',
            height: 'calc(' + height + ' + ' + b + ' + ' + b + ' + 24pt)'
          };
        case Paper.LETTER_LANDSCAPE:
          return { width: letter.height, height: letter.width };
        case Paper.LETTER_PORTRAIT:
          return letter;
        case Paper.A4_PORTRAIT:
          return a4;
        case Paper.A4_LANDSCAPE:
          return { width: a4.height, height: a4.width };
        default:
      }
      return { width: width, height: height };
    }
  }]);
  return PageSetup;
}();

/* global BINDERY_VERSION */

var errorView = function (title, text) {
  return el('.error', [el('.error-title', title), el('.error-text', text), el('.error-footer', 'Bindery ' + BINDERY_VERSION)]);
};

var orderPagesBooklet = function orderPagesBooklet(pages, makePage) {
  while (pages.length % 4 !== 0) {
    var spacerPage = makePage();
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

var padPages = function padPages(pages, makePage) {
  if (pages.length % 2 !== 0) {
    var pg = makePage();
    pages.push(pg);
  }
  var spacerPage = makePage();
  var spacerPage2 = makePage();
  spacerPage.element.style.visibility = 'hidden';
  spacerPage2.element.style.visibility = 'hidden';
  pages.unshift(spacerPage);
  pages.push(spacerPage2);

  return pages;
};

var twoPageSpread = function twoPageSpread(children) {
  return el('.spread-wrapper.spread-size', children);
};
var onePageSpread = function onePageSpread(children) {
  return el('.spread-wrapper.page-size', children);
};

var renderGridLayout = function renderGridLayout(pages, isTwoUp) {
  var gridLayout = document.createDocumentFragment();
  if (isTwoUp) {
    for (var i = 0; i < pages.length; i += 2) {
      var wrap = twoPageSpread([pages[i].element, pages[i + 1].element]);
      gridLayout.appendChild(wrap);
    }
  } else {
    pages.forEach(function (pg) {
      var wrap = onePageSpread([pg.element]);
      gridLayout.appendChild(wrap);
    });
  }

  return gridLayout;
};

var directions = ['top', 'bottom', 'left', 'right'];
var bleedMarks = function bleedMarks() {
  return directions.map(function (dir) {
    return el('.bleed-' + dir);
  });
};
var cropMarks = function cropMarks() {
  return directions.map(function (dir) {
    return el('.crop' + dir);
  });
};

var printMarksSingle = function printMarksSingle() {
  return el('.print-mark-wrap', [].concat(toConsumableArray(cropMarks()), toConsumableArray(bleedMarks())));
};

var printMarksSpread = function printMarksSpread() {
  return el('.print-mark-wrap', [el('.crop-fold')].concat(toConsumableArray(cropMarks()), toConsumableArray(bleedMarks())));
};

var bookletMeta = function bookletMeta(i, len) {
  var isFront = i % 4 === 0;
  var sheetIndex = parseInt((i + 1) / 4, 10) + 1;
  return el('.print-meta', 'Sheet ' + sheetIndex + ' of ' + len / 4 + ': ' + (isFront ? 'Outside' : 'Inside'));
};

var twoPageSpread$1 = function twoPageSpread(children) {
  return el('.spread-wrapper.spread-size', children);
};
var onePageSpread$1 = function onePageSpread(children) {
  return el('.spread-wrapper.page-size', children);
};

var renderPrintLayout = function renderPrintLayout(pages, isTwoUp, isBooklet) {
  var printLayout = document.createDocumentFragment();

  var marks = isTwoUp ? printMarksSpread : printMarksSingle;
  var spread = isTwoUp ? twoPageSpread$1 : onePageSpread$1;

  var printSheet = function printSheet(children) {
    return el('.print-page', [spread(children)]);
  };

  if (isTwoUp) {
    for (var i = 0; i < pages.length; i += 2) {
      var spreadMarks = marks();
      if (isBooklet) {
        var meta = bookletMeta(i, pages.length);
        spreadMarks.appendChild(meta);
      }
      var sheet = printSheet([pages[i].element, pages[i + 1].element, spreadMarks]);
      printLayout.appendChild(sheet);
    }
  } else {
    pages.forEach(function (pg) {
      var sheet = printSheet([pg.element, marks()]);
      printLayout.appendChild(sheet);
    });
  }

  return printLayout;
};

var renderFlipLayout = function renderFlipLayout(pages, doubleSided) {
  var flipLayout = document.createDocumentFragment();
  var sizer = el('.spread-size.flip-sizer');
  var flapHolder = el('.spread-size.flap-holder');
  sizer.appendChild(flapHolder);
  flipLayout.appendChild(sizer);
  var flaps = [];
  var currentLeaf = -1;

  var leftOffset = 4;
  if (pages.length * leftOffset > 60) {
    leftOffset = 60 / pages.length;
  }
  flapHolder.style.width = pages.length * leftOffset + 'px';

  var setLeaf = function setLeaf(n) {
    var newLeaf = n;
    if (newLeaf === currentLeaf) newLeaf += 1;
    currentLeaf = newLeaf;

    var zScale = 4;
    if (flaps.length * zScale > 200) zScale = 200 / flaps.length;

    flaps.forEach(function (flap, i, arr) {
      // + 0.5 so left and right are even
      var z = (arr.length - Math.abs(i - newLeaf + 0.5)) * zScale;
      flap.style.transform = 'translate3d(' + (i < newLeaf ? 4 : 0) + 'px,0,' + z + 'px) rotateY(' + (i < newLeaf ? -180 : 0) + 'deg)';
    });
  };

  var leafIndex = 0;

  var _loop = function _loop(i) {
    leafIndex += 1;
    var li = leafIndex;
    var flap = el('.page3d');
    flap.addEventListener('click', function () {
      var newLeaf = li - 1;
      setLeaf(newLeaf);
    });

    var rightPage = pages[i].element;
    var leftPage = void 0;
    rightPage.classList.add(c('page3d-front'));
    flap.appendChild(rightPage);
    if (doubleSided) {
      flap.classList.add(c('doubleSided'));
      leftPage = pages[i + 1].element;
      leftPage.classList.add(c('page3d-back'));
      flap.appendChild(leftPage);
    } else {
      leftPage = el('.page.page3d-back');
      flap.appendChild(leftPage);
    }
    // TODO: Dynamically add/remove pages.
    // Putting 1000s of elements onscreen
    // locks up the browser.

    flap.style.left = i * leftOffset + 'px';

    flaps.push(flap);
    flapHolder.appendChild(flap);
  };

  for (var i = 1; i < pages.length - 1; i += doubleSided ? 2 : 1) {
    _loop(i);
  }

  setLeaf(0);
  return flipLayout;
};

// import Controls from './Controls';
var modeAttr = {};
modeAttr[Mode.PREVIEW] = 'preview';
modeAttr[Mode.PRINT] = 'print';
modeAttr[Mode.FLIPBOOK] = 'flip';

var Viewer = function () {
  function Viewer(_ref) {
    var _this = this;

    var bindery = _ref.bindery,
        mode = _ref.mode,
        layout = _ref.layout,
        marks = _ref.marks,
        ControlsComponent = _ref.ControlsComponent;
    classCallCheck(this, Viewer);

    this.book = null;
    this.pageSetup = bindery.pageSetup;

    this.progressBar = el('.progress-bar');
    this.zoomBox = el('zoom-wrap');
    this.element = el('root', [this.progressBar, this.zoomBox]);

    this.doubleSided = true;
    this.printArrange = layout;

    this.setMarks(marks);
    this.mode = mode;
    this.element.setAttribute('bindery-view-mode', modeAttr[this.mode]);
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    this.setPrint = this.setPrint.bind(this);

    if (ControlsComponent) {
      this.controls = new ControlsComponent({ Mode: Mode, Paper: Paper, Layout: Layout, Marks: Marks }, // Available options
      { // Initial props
        paper: this.pageSetup.sheetSizeMode,
        layout: this.printArrange,
        mode: this.mode,
        marks: marks
      }, { // Actions
        setMode: function setMode(newMode) {
          if (newMode === _this.mode) return;
          _this.mode = newMode;
          _this.render();
        },
        setPaper: this.setSheetSize.bind(this),
        setLayout: this.setPrintArrange.bind(this),
        setMarks: this.setMarks.bind(this),
        getPageSize: function getPageSize() {
          return _this.pageSetup.displaySize;
        }
      });
      this.element.appendChild(this.controls.element);
    }

    this.element.classList.add(c('in-progress'));

    document.body.appendChild(this.element);
  }

  // Automatically switch into print mode


  createClass(Viewer, [{
    key: 'listenForPrint',
    value: function listenForPrint() {
      var _this2 = this;

      if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function (mql) {
          if (mql.matches) {
            // before print
            _this2.setPrint();
          } else {
            // after print
          }
        });
      }
      document.body.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 80) {
          e.preventDefault();
          _this2.setPrint();
          setTimeout(function () {
            window.print();
          }, 10);
        }
      });
    }
  }, {
    key: 'listenForResize',
    value: function listenForResize() {
      var _this3 = this;

      window.addEventListener('resize', function () {
        if (!_this3.throttleResize) {
          _this3.updateZoom();
          _this3.throttleResize = setTimeout(function () {
            _this3.throttleResize = null;
          }, 20);
        }
      });
    }
  }, {
    key: 'setInProgress',
    value: function setInProgress() {
      this.element.classList.add(c('in-progress'));
      if (this.controls) this.controls.setInProgress();
    }
  }, {
    key: 'setSheetSize',
    value: function setSheetSize(newVal) {
      var _this4 = this;

      this.pageSetup.sheetSizeMode = newVal;
      this.pageSetup.updateStylesheet();

      if (this.mode !== Mode.PRINT) {
        this.setPrint();
      }
      this.updateZoom();
      setTimeout(function () {
        _this4.updateZoom();
      }, 300);
    }
  }, {
    key: 'setPrintArrange',
    value: function setPrintArrange(newVal) {
      if (newVal === this.printArrange) return;
      this.printArrange = newVal;

      this.pageSetup.setPrintTwoUp(this.isTwoUp);
      this.pageSetup.updateStylesheet();

      if (this.mode === Mode.PRINT) {
        this.render();
      } else {
        this.setPrint();
      }
    }
  }, {
    key: 'setMarks',
    value: function setMarks(newVal) {
      switch (newVal) {
        case Marks.NONE:
          this.isShowingCropMarks = false;
          this.isShowingBleedMarks = false;
          break;
        case Marks.CROP:
          this.isShowingCropMarks = true;
          this.isShowingBleedMarks = false;
          break;
        case Marks.BLEED:
          this.isShowingCropMarks = false;
          this.isShowingBleedMarks = true;
          break;
        case Marks.BOTH:
          this.isShowingCropMarks = true;
          this.isShowingBleedMarks = true;
          break;
        default:
      }
    }
  }, {
    key: 'displayError',
    value: function displayError(title, text) {
      if (!this.element.parentNode) {
        document.body.appendChild(this.element);
      }
      if (!this.error) {
        this.error = errorView(title, text);
        this.element.appendChild(this.error);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.book = null;
      this.lastSpreadInProgress = null; // TODO: Make this clearer, after first render
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
    key: 'toggleBleed',
    value: function toggleBleed() {
      this.element.classList.add(c('show-bleed'));
    }
  }, {
    key: 'toggleDouble',
    value: function toggleDouble() {
      this.doubleSided = !this.doubleSided;
      this.render();
    }
  }, {
    key: 'setPrint',
    value: function setPrint() {
      if (this.mode === Mode.PRINT) return;
      this.mode = Mode.PRINT;
      this.render();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      if (!this.book) return;
      var _document = document,
          body = _document.body;

      if (!this.element.parentNode) {
        body.appendChild(this.element);
      }

      this.flaps = [];
      body.classList.add(c('viewing'));
      this.element.setAttribute('bindery-view-mode', modeAttr[this.mode]);

      var scrollMax = body.scrollHeight - body.offsetHeight;
      var scrollPct = body.scrollTop / scrollMax;

      if (this.controls) this.controls.setDone(this.book.pages.length);
      this.progressBar.style.width = '100%';

      window.requestAnimationFrame(function () {
        if (_this5.mode === Mode.PREVIEW) _this5.renderGrid();else if (_this5.mode === Mode.FLIPBOOK) _this5.renderInteractive();else if (_this5.mode === Mode.PRINT) _this5.renderPrint();else _this5.renderGrid();

        body.scrollTop = scrollMax * scrollPct;
        _this5.updateZoom();
      });
    }
  }, {
    key: 'renderProgress',
    value: function renderProgress(book) {
      var _this6 = this;

      this.book = book;

      this.progressBar.style.width = this.book.estimatedProgress * 100 + '%';

      if (this.controls) {
        this.controls.updateProgress(this.book.pages.length, this.book.estimatedProgress);
      }

      var sideBySide = this.mode === Mode.PREVIEW || this.mode === Mode.PRINT && this.printArrange !== Layout.PAGES;
      var limit = sideBySide ? 2 : 1;

      var makeSpread = function makeSpread() {
        for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
          arg[_key] = arguments[_key];
        }

        return el('.spread-wrapper', [].concat(arg));
      };

      this.book.pages.forEach(function (page, i) {
        // If hasn't been added, or not in spread yet
        if (!_this6.zoomBox.contains(page.element) || page.element.parentNode === _this6.zoomBox) {
          if (_this6.lastSpreadInProgress && _this6.lastSpreadInProgress.children.length < limit) {
            _this6.lastSpreadInProgress.appendChild(page.element);
          } else {
            if (i === 0 && sideBySide) {
              var spacer = new Page();
              spacer.element.style.visibility = 'hidden';
              _this6.lastSpreadInProgress = makeSpread(spacer.element, page.element);
            } else {
              _this6.lastSpreadInProgress = makeSpread(page.element);
            }
            _this6.zoomBox.appendChild(_this6.lastSpreadInProgress);
          }
        }
      });

      if (this.book.pageInProgress) {
        this.zoomBox.appendChild(this.book.pageInProgress.element);
      }

      this.updateZoom();
    }
  }, {
    key: 'updateZoom',
    value: function updateZoom() {
      if (this.zoomBox.firstElementChild) {
        var scrollPct = document.body.scrollTop / document.body.scrollHeight;
        var viewerRect = this.zoomBox.getBoundingClientRect();
        var contentW = this.zoomBox.firstElementChild.getBoundingClientRect().width;
        var scale = Math.min(1, viewerRect.width / contentW);

        this.zoomBox.style.transform = 'scale(' + scale + ')';
        document.body.scrollTop = document.body.scrollHeight * scrollPct;
      }
    }
  }, {
    key: 'renderPrint',
    value: function renderPrint() {
      this.element.classList.add(c('show-bleed'));

      this.zoomBox.innerHTML = '';

      var isBooklet = this.printArrange === Layout.BOOKLET;

      var pages = this.book.pages.slice();
      if (this.printArrange === Layout.SPREADS) {
        pages = padPages(pages, function () {
          return new Page();
        });
      } else if (isBooklet) {
        pages = orderPagesBooklet(pages, function () {
          return new Page();
        });
      }

      var fragment = renderPrintLayout(pages, this.isTwoUp, isBooklet);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'renderGrid',
    value: function renderGrid() {
      this.zoomBox.innerHTML = '';

      this.element.classList.remove(c('show-bleed'));

      var pages = this.book.pages.slice();

      if (this.doubleSided) pages = padPages(pages, function () {
        return new Page();
      });

      var fragment = renderGridLayout(pages, this.doubleSided);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'renderInteractive',
    value: function renderInteractive() {
      this.zoomBox.innerHTML = '';
      this.flaps = [];

      this.element.classList.remove(c('show-bleed'));

      var pages = padPages(this.book.pages.slice(), function () {
        return new Page();
      });

      var fragment = renderFlipLayout(pages, this.doubleSided);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'isTwoUp',
    get: function get$$1() {
      return this.printArrange !== Layout.PAGES;
    }
  }, {
    key: 'isShowingCropMarks',
    get: function get$$1() {
      return this.element.classList.contains(c('show-crop'));
    },
    set: function set$$1(newVal) {
      if (newVal) {
        this.element.classList.add(c('show-crop'));
        this.setPrint();
      } else {
        this.element.classList.remove(c('show-crop'));
      }
    }
  }, {
    key: 'isShowingBleedMarks',
    get: function get$$1() {
      return this.element.classList.contains(c('show-bleed-marks'));
    },
    set: function set$$1(newVal) {
      if (newVal) {
        this.element.classList.add(c('show-bleed-marks'));
        this.setPrint();
      } else {
        this.element.classList.remove(c('show-bleed-marks'));
      }
    }
  }]);
  return Viewer;
}();

var Split = function (_Rule) {
  inherits(Split, _Rule);

  function Split(options) {
    classCallCheck(this, Split);

    options.toNext = options.toNext || 'split-to-next';
    options.fromPrevious = options.fromPrevious || 'split-from-previous';

    var _this = possibleConstructorReturn(this, (Split.__proto__ || Object.getPrototypeOf(Split)).call(this, options));

    OptionType.validate(options, {
      name: 'Split',
      selector: OptionType.string,
      toNext: OptionType.string,
      fromPrevious: OptionType.string
    });
    return _this;
  }

  createClass(Split, [{
    key: 'customToNextClass',
    get: function get$$1() {
      return this.toNext;
    }
  }, {
    key: 'customFromPreviousClass',
    get: function get$$1() {
      return this.fromPrevious;
    }
  }]);
  return Split;
}(Rule);

var Counter = function (_Rule) {
  inherits(Counter, _Rule);

  function Counter(options) {
    classCallCheck(this, Counter);

    var _this = possibleConstructorReturn(this, (Counter.__proto__ || Object.getPrototypeOf(Counter)).call(this, options));

    _this.selector = '*';
    _this.counterValue = 0;
    OptionType.validate(options, {
      name: 'Counter',
      replaceEl: OptionType.string,
      resetEl: OptionType.string,
      incrementEl: OptionType.string,
      replace: OptionType.func
    });
    return _this;
  }

  createClass(Counter, [{
    key: 'setup',
    value: function setup() {
      this.counterValue = 0;
    }
  }, {
    key: 'beforeAdd',
    value: function beforeAdd(el$$1) {
      if (el$$1.matches(this.incrementEl)) {
        this.counterValue += 1;
      }
      if (el$$1.matches(this.resetEl)) {
        this.counterValue = 0;
      }
      if (el$$1.matches(this.replaceEl)) {
        return this.createReplacement(el$$1);
      }
      return el$$1;
    }
  }, {
    key: 'createReplacement',
    value: function createReplacement(element) {
      return this.replace(element, this.counterValue);
    }
  }, {
    key: 'replace',
    value: function replace(element, counterValue) {
      element.textContent = counterValue;
      return element;
    }
  }]);
  return Counter;
}(Rule);

// Options:
// selector: String
// replace: function (HTMLElement) => HTMLElement

var Replace = function (_Rule) {
  inherits(Replace, _Rule);

  function Replace(options) {
    classCallCheck(this, Replace);

    var _this = possibleConstructorReturn(this, (Replace.__proto__ || Object.getPrototypeOf(Replace)).call(this, options));

    _this.name = 'Replace';
    return _this;
  }

  createClass(Replace, [{
    key: 'afterAdd',
    value: function afterAdd(element, book, continueOnNewPage, makeNewPage, overflowCallback) {
      var parent = element.parentNode;
      if (!parent) {
        throw Error('Bindery: Rule assumes element has been added but it has no parent.', element);
      }
      var defensiveClone = element.cloneNode(true);
      var replacement = this.createReplacement(book, defensiveClone);
      parent.replaceChild(replacement, element);

      if (book.pageInProgress.hasOverflowed()) {
        parent.replaceChild(element, replacement);

        return overflowCallback(element);
      }

      return replacement;
    }
  }, {
    key: 'createReplacement',
    value: function createReplacement(book, element) {
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
}(Rule);

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
// render: function (Page) => HTMLElement

var Footnote = function (_Replace) {
  inherits(Footnote, _Replace);

  function Footnote(options) {
    classCallCheck(this, Footnote);

    var _this = possibleConstructorReturn(this, (Footnote.__proto__ || Object.getPrototypeOf(Footnote)).call(this, options));

    OptionType.validate(options, {
      name: 'Footnote',
      selector: OptionType.string,
      replace: OptionType.func,
      render: OptionType.func
    });
    return _this;
  }

  createClass(Footnote, [{
    key: 'afterAdd',
    value: function afterAdd(element, book, continueOnNewPage, makeNewPage, overflowCallback) {
      var number = book.pageInProgress.footer.children.length + 1;

      var footnote = el('.footnote');
      var contents = this.render(element, number);
      if (contents instanceof HTMLElement) footnote.appendChild(contents);else footnote.innerHTML = contents;

      book.pageInProgress.footer.appendChild(footnote);

      return get(Footnote.prototype.__proto__ || Object.getPrototypeOf(Footnote.prototype), 'afterAdd', this).call(this, element, book, continueOnNewPage, makeNewPage, function (overflowEl) {
        book.pageInProgress.footer.removeChild(footnote);
        return overflowCallback(overflowEl);
      });
    }
  }, {
    key: 'createReplacement',
    value: function createReplacement(book, element) {
      var number = book.pageInProgress.footer.children.length;
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
      return '<sup>' + number + '</sup> Default footnote (<a href=\'/bindery/docs/#footnote\'>Learn how to change it</a>)';
    }
  }]);
  return Footnote;
}(Replace);

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement

var PageReference = function (_Replace) {
  inherits(PageReference, _Replace);

  function PageReference(options) {
    classCallCheck(this, PageReference);

    var _this = possibleConstructorReturn(this, (PageReference.__proto__ || Object.getPrototypeOf(PageReference)).call(this, options));

    OptionType.validate(options, {
      name: 'PageReference',
      selector: OptionType.string,
      replace: OptionType.func,
      createTest: OptionType.func
    });
    return _this;
  }

  createClass(PageReference, [{
    key: 'afterAdd',
    value: function afterAdd(elmt, book) {
      var _this2 = this;

      var test = this.createTest(elmt);
      if (test) {
        // Temporary, to make sure it'll fit
        var parent = elmt.parentNode;
        var tempClone = elmt.cloneNode(true);
        var tempNumbers = book.pagesForTest(test);
        var tempRanges = makeRanges(tempNumbers);
        var temp = this.replace(tempClone, tempRanges || '###');
        temp.classList.add(c('placeholder-pulse'));
        parent.replaceChild(temp, elmt);

        book.onComplete(function () {
          var tempParent = temp.parentNode;
          var finalClone = elmt.cloneNode(true);
          var pageNumbers = book.pagesForTest(test);
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
        // extra resilient in case it starts with a number ie wikipedia
        selector = '[id="' + selector + '"]';
        return function (el$$1) {
          return el$$1.querySelector(selector);
        };
      }
      return null;
    }
  }, {
    key: 'replace',
    value: function replace(original, number) {
      original.insertAdjacentHTML('beforeend', ', <span>' + number + '</span>');
      return original;
    }
  }]);
  return PageReference;
}(Replace);

// Options:
// selector: String
// render: function (Page) => HTMLElement
// TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

var RunningHeader = function (_Rule) {
  inherits(RunningHeader, _Rule);

  function RunningHeader() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, RunningHeader);

    var _this = possibleConstructorReturn(this, (RunningHeader.__proto__ || Object.getPrototypeOf(RunningHeader)).call(this, options));

    OptionType.validate(options, {
      name: 'RunningHeader',
      render: OptionType.func
    });
    return _this;
  }

  createClass(RunningHeader, [{
    key: 'eachPage',
    value: function eachPage(page) {
      if (!page.runningHeader) {
        var elmt = el('.running-header');
        page.element.appendChild(elmt);
        page.runningHeader = elmt;
      }
      page.runningHeader.innerHTML = this.render(page);
    }
  }, {
    key: 'render',
    value: function render(page) {
      return page.number;
    }
  }]);
  return RunningHeader;
}(Rule);

var Rules = {
  Rule: Rule,
  Split: function Split$$1(options) {
    return new Split(options);
  },
  Counter: function Counter$$1(options) {
    return new Counter(options);
  },
  FullBleedPage: function FullBleedPage$$1(options) {
    return new FullBleedPage(options);
  },
  Footnote: function Footnote$$1(options) {
    return new Footnote(options);
  },
  RunningHeader: function RunningHeader$$1(options) {
    return new RunningHeader(options);
  },
  Replace: function Replace$$1(options) {
    return new Replace(options);
  },
  FullBleedSpread: function FullBleedSpread$$1(options) {
    return new FullBleedSpread(options);
  },
  PageBreak: function PageBreak$$1(options) {
    return new PageBreak(options);
  },
  PageReference: function PageReference$$1(options) {
    return new PageReference(options);
  },
  createRule: function createRule(options) {
    return new Rule(options);
  }
};

var PageBreak$1 = Rules.PageBreak;
var PageReference$1 = Rules.PageReference;
var Footnote$1 = Rules.Footnote;
var FullBleedPage$1 = Rules.FullBleedPage;
var FullBleedSpread$1 = Rules.FullBleedSpread;


var replacer = function replacer(element, number) {
  element.textContent = '' + number;
  return element;
};

var defaultRules = [PageBreak$1({ selector: '[book-page-break="both"]', position: 'both' }), PageBreak$1({ selector: '[book-page-break="avoid"]', position: 'avoid' }), PageBreak$1({ selector: '[book-page-break="after"][book-page-continue="right"]', position: 'after', continue: 'right' }), PageBreak$1({ selector: '[book-page-break="after"][book-page-continue="left"]', position: 'after', continue: 'left' }), PageBreak$1({ selector: '[book-page-break="after"][book-page-continue="next"]', position: 'after', continue: 'next' }), PageBreak$1({ selector: '[book-page-break="before"][book-page-continue="right"]', position: 'before', continue: 'right' }), PageBreak$1({ selector: '[book-page-break="before"][book-page-continue="left"]', position: 'before', continue: 'left' }), PageBreak$1({ selector: '[book-page-break="before"][book-page-continue="next"]', position: 'before', continue: 'next' }), FullBleedPage$1({ selector: '[book-full-bleed="page"]' }), FullBleedSpread$1({ selector: '[book-full-bleed="spread"]' }), Footnote$1({
  selector: '[book-footnote-text]',
  render: function render(element, number) {
    var txt = element.getAttribute('book-footnote-text');
    return '<i>' + number + '</i>' + txt;
  }
}), PageReference$1({
  selector: '[book-pages-with-text]',
  replace: replacer,
  createTest: function createTest(element) {
    var term = element.getAttribute('book-pages-with-text').toLowerCase().trim();
    return function (page) {
      var txt = page.textContent.toLowerCase();
      return txt.includes(term);
    };
  }
}), PageReference$1({
  selector: '[book-pages-with-selector]',
  replace: replacer,
  createTest: function createTest(element) {
    var sel = element.getAttribute('book-pages-with-selector').trim();
    return function (page) {
      return page.querySelector(sel);
    };
  }
}), PageReference$1({
  selector: '[book-pages-with]',
  replace: replacer,
  createTest: function createTest(element) {
    var term = element.textContent.toLowerCase().trim();
    return function (page) {
      var txt = page.textContent.toLowerCase();
      return txt.includes(term);
    };
  }
})];

___$insertStyle("@charset \"UTF-8\";@media screen{.📖-page{background:#fff;outline:1px solid #ddd;box-shadow:0 2px 4px -1px rgba(0,0,0,.15);overflow:hidden}.📖-show-bleed .📖-page{box-shadow:none;outline:none;overflow:visible}.📖-page:after{content:\"\";position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:3}}li.📖-continuation,p.📖-continuation{text-indent:unset!important}li.📖-continuation{list-style:none!important}.📖-out-of-flow{display:none}.📖-page{width:var(--bindery-page-width);height:var(--bindery-page-height);position:relative;display:flex;flex-direction:column;flex-wrap:nowrap}.📖-flowbox{position:relative;margin:60px 40px;margin-bottom:0;flex:1 1 auto;min-height:0}.📖-content{padding:.1px;position:relative}.📖-footer{margin:60px 40px;margin-top:8pt;flex:0 1 auto;z-index:1}.📖-background{position:absolute;z-index:0;overflow:hidden}.📖-left>.📖-background{right:0}.📖-right>.📖-background{left:0}.📖-sup{font-size:.667em}.📖-footer,.📖-running-header{font-size:10pt}.📖-running-header{position:absolute;text-align:center;top:.25in}.📖-left .📖-running-header{left:18pt;text-align:left}.📖-right .📖-running-header{right:18pt;text-align:right}.📖-left .📖-rotate-container.📖-rotate-outward,.📖-left .📖-rotate-container.📖-rotate-spread-clockwise,.📖-right .📖-rotate-container.📖-rotate-inward,.📖-rotate-container.📖-rotate-clockwise{transform:rotate(90deg) translate3d(0,-100%,0);transform-origin:top left}.📖-left .📖-rotate-container.📖-rotate-inward,.📖-left .📖-rotate-container.📖-rotate-spread-counterclockwise,.📖-right .📖-rotate-container.📖-rotate-outward,.📖-rotate-container.📖-rotate-counterclockwise{transform:rotate(-90deg) translate3d(-100%,0,0);transform-origin:top left}.📖-rotate-container{position:absolute}.📖-left .📖-rotate-container.📖-rotate-clockwise .📖-background{bottom:0}.📖-left .📖-rotate-container.📖-rotate-counterclockwise .📖-background,.📖-right .📖-rotate-container.📖-rotate-clockwise .📖-background{top:0}.📖-right .📖-rotate-container.📖-rotate-counterclockwise .📖-background,.📖-rotate-container.📖-rotate-inward .📖-background{bottom:0}.📖-rotate-container.📖-rotate-outward .📖-background{top:0}.📖-right .📖-rotate-container.📖-rotate-spread-clockwise{transform:rotate(90deg) translate3d(0,-50%,0);transform-origin:top left}.📖-right .📖-rotate-container.📖-rotate-spread-counterclockwise{transform:rotate(-90deg) translate3d(-100%,-50%,0);transform-origin:top left}@media screen{.📖-viewing{background:#f4f4f4!important}.📖-root{transition:opacity .2s;opacity:1;background:#f4f4f4;padding:10px;z-index:2;position:relative;padding-top:60px;min-height:90vh}.📖-progress-bar{position:fixed;left:0;top:0;background:var(--bindery-ui-accent,#0000c5);width:0;transition:all .2s;opacity:0;height:0;z-index:2}.📖-in-progress .📖-progress-bar{opacity:1;height:2px}.📖-measure-area{position:fixed;background:#f4f4f4;padding:50px 20px;z-index:2;visibility:hidden;left:0;right:0;bottom:0}.📖-measure-area .📖-page{margin:0 auto 50px}.📖-is-overflowing{border-bottom:1px solid #f0f}.📖-print-page{margin:0 auto}.📖-error{font:16px/1.4 -apple-system,BlinkMacSystemFont,Roboto,sans-serif;padding:15vh 15vw;z-index:3;position:fixed;top:0;left:0;right:0;bottom:0;background:hsla(0,0%,96%,.7)}.📖-error-title{font-size:1.5em;margin-bottom:16px}.📖-error-text{margin-bottom:16px;white-space:pre-line}.📖-error-footer{opacity:.5;font-size:.66em;text-transform:uppercase;letter-spacing:.02em}.📖-show-bleed .📖-print-page{background:#fff;outline:1px solid rgba(0,0,0,.1);box-shadow:0 1px 3px rgba(0,0,0,.2);margin:20px auto}.📖-placeholder-pulse{animation:pulse 1s infinite}}@keyframes pulse{0%{opacity:.2}50%{opacity:.5}to{opacity:.2}}@page{margin:0}@media print{.📖-root *{-webkit-print-color-adjust:exact;color-adjust:exact}.📖-controls,.📖-viewing>:not(.📖-root){display:none!important}.📖-print-page{padding:1px;margin:0 auto}.📖-zoom-wrap[style]{transform:none!important}}body.📖-viewing{margin:0}.📖-zoom-wrap{transform-origin:top left;transform-style:preserve-3d;height:calc(100vh - 120px)}[bindery-view-mode=interactive] .📖-zoom-wrap{transform-origin:center left}.📖-viewing>:not(.📖-root):not(.📖-measure-area){display:none!important}.📖-print-page{page-break-after:always;overflow:hidden;align-items:center;transition:all .2s}.📖-print-page,.📖-spread-wrapper{position:relative;display:flex;justify-content:center}.📖-spread-wrapper{margin:0 auto 32px}.📖-print-page .📖-spread-wrapper{margin:0 auto}.📖-flap-holder{perspective:5000px;position:absolute;top:0;right:0;left:0;bottom:0;margin:auto;transform-style:preserve-3d}.📖-flip-sizer{position:relative;margin:auto;padding:0 20px;box-sizing:content-box;height:100%!important}.📖-page3d{margin:auto;width:var(--bindery-page-width);height:var(--bindery-page-height);transform:rotateY(0);transform-style:preserve-3d;transform-origin:left;transition:transform .5s,box-shadow .1s;position:absolute;left:0;right:0;top:0;bottom:0}.📖-page3d:hover{box-shadow:2px 0 4px rgba(0,0,0,.2)}.📖-page3d.flipped{transform:rotateY(-180deg)}.📖-page3d .📖-page{position:absolute;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:none}.📖-page3d .📖-page3d-front{transform:rotateY(0)}.📖-page3d .📖-page3d-back{transform:rotateY(-180deg)}.📖-print-mark-wrap{display:none;position:absolute;pointer-events:none;top:0;bottom:0;left:0;right:0;z-index:3}.📖-show-bleed-marks .📖-print-mark-wrap,.📖-show-bleed-marks .📖-print-mark-wrap>[class*=bleed],.📖-show-crop .📖-print-mark-wrap,.📖-show-crop .📖-print-mark-wrap>[class*=crop]{display:block}.📖-print-mark-wrap>div{display:none;position:absolute;overflow:hidden}.📖-print-mark-wrap>div:after,.📖-print-mark-wrap>div:before{content:\"\";display:block;position:absolute}.📖-print-mark-wrap>div:before{top:0;left:0}.📖-print-mark-wrap>div:after{bottom:0;right:0}.📖-bleed-left,.📖-bleed-right,.📖-crop-fold,.📖-crop-left,.📖-crop-right{width:1px;margin:auto}.📖-bleed-left:after,.📖-bleed-left:before,.📖-bleed-right:after,.📖-bleed-right:before,.📖-crop-fold:after,.📖-crop-fold:before,.📖-crop-left:after,.📖-crop-left:before,.📖-crop-right:after,.📖-crop-right:before{width:1px;height:12pt;background-image:linear-gradient(90deg,#000 0,#000 51%,transparent 0);background-size:1px 100%}.📖-bleed-bottom,.📖-bleed-top,.📖-crop-bottom,.📖-crop-top{height:1px}.📖-bleed-bottom:after,.📖-bleed-bottom:before,.📖-bleed-top:after,.📖-bleed-top:before,.📖-crop-bottom:after,.📖-crop-bottom:before,.📖-crop-top:after,.📖-crop-top:before{width:12pt;height:1px;background-image:linear-gradient(180deg,#000 0,#000 51%,transparent 0);background-size:100% 1px}.📖-crop-fold{right:0;left:0}.📖-crop-left{left:0}.📖-crop-right{right:0}.📖-crop-top{top:0}.📖-crop-bottom{bottom:0}.📖-print-meta{padding:12pt;text-align:center;font-family:-apple-system,BlinkMacSystemFont,Roboto,sans-serif;font-size:8pt;display:block!important;position:absolute;bottom:-60pt;left:0;right:0}");

/* global BINDERY_VERSION */

var Bindery = function () {
  function Bindery() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Bindery);

    console.log('\uD83D\uDCD6 Bindery ' + BINDERY_VERSION);

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;
    scheduler.isDebugging = opts.debug || urlQuery('debug') || false;

    OptionType.validate(opts, {
      name: 'makeBook',
      autorun: OptionType.bool,
      content: OptionType.any,
      ControlsComponent: OptionType.any,
      pageSetup: OptionType.shape({
        name: 'pageSetup',
        bleed: OptionType.length,
        margin: OptionType.shape({
          name: 'margin',
          top: OptionType.length,
          inner: OptionType.length,
          outer: OptionType.length,
          bottom: OptionType.length
        }),
        size: OptionType.shape({
          name: 'size',
          width: OptionType.length,
          height: OptionType.length
        })
      }),
      view: OptionType.enum.apply(OptionType, toConsumableArray(Object.values(Mode))),
      printSetup: OptionType.shape({
        name: 'printSetup',
        layout: OptionType.enum.apply(OptionType, toConsumableArray(Object.values(Layout))),
        marks: OptionType.enum.apply(OptionType, toConsumableArray(Object.values(Marks))),
        paper: OptionType.enum.apply(OptionType, toConsumableArray(Object.values(Paper)))
      }),
      rules: OptionType.array
    });

    this.pageSetup = new PageSetup(opts.pageSetup);
    this.pageSetup.setupPaper(opts.printSetup);

    var startLayout = opts.printSetup ? opts.printSetup.layout || Layout.PAGES : Layout.PAGES;
    var startMarks = opts.printSetup ? opts.printSetup.marks || Marks.CROP : Marks.CROP;
    this.viewer = new Viewer({
      bindery: this,
      mode: opts.view || Mode.PREVIEW,
      marks: startMarks,
      layout: startLayout,
      ControlsComponent: opts.ControlsComponent
    });

    this.rules = defaultRules;
    if (opts.rules) this.addRules(opts.rules);

    if (!opts.content) {
      this.viewer.displayError('Content not specified', 'You must include a source element, selector, or url');
      console.error('Bindery: You must include a source element or selector');
    } else if (typeof opts.content === 'string') {
      this.source = document.querySelector(opts.content);
      if (!(this.source instanceof HTMLElement)) {
        this.viewer.displayError('Content not specified', 'Could not find element that matches selector "' + opts.content + '"');
        console.error('Bindery: Could not find element that matches selector "' + opts.content + '"');
        return;
      }
      if (this.autorun) {
        this.makeBook();
      }
    } else if (_typeof(opts.content) === 'object' && opts.content.url) {
      var url = opts.content.url;
      var selector = opts.content.selector;
      this.fetchSource(url, selector);
    } else if (opts.content instanceof HTMLElement) {
      this.source = opts.content;
      if (this.autorun) {
        this.makeBook();
      }
    } else {
      console.error('Bindery: Source must be an element or selector');
    }
  }

  // Convenience constructor


  createClass(Bindery, [{
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
      this.viewer.cancel();
      document.body.classList.remove(c('viewing'));
      this.source.style.display = '';
    }
  }, {
    key: 'addRules',
    value: function addRules(newRules) {
      var _this2 = this;

      newRules.forEach(function (rule) {
        if (rule instanceof Rules.Rule) {
          _this2.rules.push(rule);
        } else {
          throw Error('Bindery: The following is not an instance of Bindery.Rule and will be ignored: ' + rule);
        }
      });
    }
  }, {
    key: 'updateBookSilent',
    value: function updateBookSilent() {
      var _this3 = this;

      this.layoutComplete = false;

      this.source.style.display = '';
      var content = this.source.cloneNode(true);
      this.source.style.display = 'none';

      document.body.classList.add(c('viewing'));

      this.pageSetup.updateStylesheet();

      paginate$1({
        content: content,
        rules: this.rules,
        success: function success(book) {
          _this3.viewer.book = book;
          _this3.viewer.render();
          _this3.layoutComplete = true;
        },
        progress: function progress() {},
        error: function error(_error) {
          _this3.layoutComplete = true;
          _this3.viewer.displayError('Layout failed', _error);
        }
      });
    }
  }, {
    key: 'makeBook',
    value: function makeBook(doneBinding) {
      var _this4 = this;

      if (!this.source) {
        document.body.classList.add(c('viewing'));
        return;
      }

      this.layoutComplete = false;

      if (!this.pageSetup.isSizeValid()) {
        this.viewer.displayError('Page is too small', 'Size: ' + JSON.stringify(this.pageSize) + ' \n Margin: ' + JSON.stringify(this.pageMargin) + ' \n Try adjusting the sizes or units.');
        console.error('Bindery: Cancelled pagination. Page is too small.');
        return;
      }

      this.source.style.display = '';
      var content = this.source.cloneNode(true);
      this.source.style.display = 'none';

      // In case we're updating an existing layout
      this.viewer.clear();

      document.body.classList.add(c('viewing'));
      if (scheduler.isDebugging) document.body.classList.add(c('debug'));

      this.pageSetup.updateStylesheet();

      this.viewer.setInProgress();

      paginate$1(content, this.rules).progress(function (book) {
        _this4.viewer.renderProgress(book);
      }).then(function (book) {
        _this4.viewer.book = book;
        _this4.viewer.render();

        _this4.layoutComplete = true;
        if (doneBinding) doneBinding();
        _this4.viewer.element.classList.remove(c('in-progress'));
        document.body.classList.remove(c('debug'));
      }).catch(function (error) {
        _this4.layoutComplete = true;
        _this4.viewer.element.classList.remove(c('in-progress'));
        _this4.viewer.displayError('Layout couldn\'t complete', error);
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

Bindery.version = BINDERY_VERSION;

var BinderyWithRules = Object.assign(Bindery, Rules);
BinderyWithRules.View = Mode;
BinderyWithRules.Paper = Paper;
BinderyWithRules.Layout = Layout;
BinderyWithRules.Marks = Marks;

return BinderyWithRules;

})));
//# sourceMappingURL=bindery.umd.js.map
