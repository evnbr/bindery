/* 📖 Bindery v2.2.0 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Bindery = factory());
}(this, (function () { 'use strict';

  const BINDERY_VERSION = 'v2.2.0'

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

  //
  // prefix classes
  const p = '📖-';

  const prefix = str => `${p}${str}`;
  const prefixClass = str => `.${prefix(str)}`;

  const prefixer = (str) => {
    if (str[0] === '.') {
      return prefixClass(str.substr(1));
    }
    return prefix(str);
  };

  const AUTO = 0;
  const AUTO_BLEED = 1;
  const AUTO_MARKS = 2;
  const LETTER_PORTRAIT = 3;
  const LETTER_LANDSCAPE = 4;
  const A4_PORTRAIT = 5;
  const A4_LANDSCAPE = 6;

  var Paper = /*#__PURE__*/Object.freeze({
    AUTO: AUTO,
    AUTO_BLEED: AUTO_BLEED,
    AUTO_MARKS: AUTO_MARKS,
    LETTER_PORTRAIT: LETTER_PORTRAIT,
    LETTER_LANDSCAPE: LETTER_LANDSCAPE,
    A4_PORTRAIT: A4_PORTRAIT,
    A4_LANDSCAPE: A4_LANDSCAPE
  });

  const FLIPBOOK = 0;
  const PREVIEW = 1;
  const PRINT = 2;

  var Mode = /*#__PURE__*/Object.freeze({
    FLIPBOOK: FLIPBOOK,
    PREVIEW: PREVIEW,
    PRINT: PRINT
  });

  const PAGES = 0;
  const SPREADS = 1;
  const BOOKLET = 2;

  var Layout = /*#__PURE__*/Object.freeze({
    PAGES: PAGES,
    BOOKLET: BOOKLET,
    SPREADS: SPREADS
  });

  const NONE = 0;
  const CROP = 1;
  const BLEED = 2;
  const BOTH = 3;

  var Marks = /*#__PURE__*/Object.freeze({
    NONE: NONE,
    CROP: CROP,
    BLEED: BLEED,
    BOTH: BOTH
  });

  const classes = {
    showBleed: 'show-bleed',
    showCrop: 'show-crop',
    showBleedMarks: 'show-bleed-marks',

    isViewing: 'viewing',
    viewPreview: 'view-preview',
    viewPrint: 'view-print',
    viewFlip: 'view-flip',
    inProgress: 'in-progress',

    leftPage: 'left',
    rightPage: 'right',
    isOverflowing: 'is-overflowing',

    toNext: 'continues',
    fromPrev: 'continuation',
  };

  Object.keys(classes).forEach((k) => {
    const val = classes[k];
    classes[k] = prefixer(val);
  });

  classes.allModes = [classes.viewPreview, classes.viewPrint, classes.viewFlip];
  classes[PREVIEW] = classes.viewPreview;
  classes[PRINT] = classes.viewPrint;
  classes[FLIPBOOK] = classes.viewFlip;

  const doc = window.document;
  // Create div with prefixed classes
  const createEl = (className, content = []) => {
    const div = doc.createElement('div');
    div.className = className.split('.').filter(txt => txt !== '').map(prefixer).join(' ');

    if (typeof content === 'string') {
      div.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach(child => div.appendChild(child));
    }
    return div;
  };

  const safeMeasure = (el, measure) => {
    if (el.parentNode) return measure();
    let measureArea = document.querySelector(prefixer('.measure-area'));
    if (!measureArea) measureArea = document.body.appendChild(createEl('measure-area'));
    if (measureArea.firstElementChild !== el) {
      measureArea.innerHTML = '';
      measureArea.appendChild(el);
    }
    const result = measure();
    return result;
  };

  const doc$1 = window.document;

  // Create stylesheet with id
  const addStylesheet = (id) => {
    const style = doc$1.createElement('style');
    style.id = id;
    doc$1.head.appendChild(style);
    return style;
  };

  // Fetch or create stylesheet with id
  const stylesheet = id => doc$1.querySelector(`#${id}`) || addStylesheet(id);

  // Parse html from text
  const parseHTML = (text, selector) => {
    const wrapper = doc$1.createElement('div');
    wrapper.innerHTML = text;
    return wrapper.querySelector(selector);
  };

  const c = prefixer;

  const cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;

  const isLength = str => cssNumberRegEx.test(str);

  const parseLength = (str) => {
    if (!isLength(str)) throw Error(`Cannot parse css length from "${str}"`);

    const matches = str.match(cssNumberRegEx);
    return {
      val: Number(matches[1]),
      unit: matches[3],
    };
  };

  var defaultPageSetup = {
    bleed: '12pt',
    size: { width: '4in', height: '6in' },
    margin: {
      inner: '24pt',
      outer: '24pt',
      bottom: '40pt',
      top: '48pt',
    },
  };

  const letter = Object.freeze({ width: '8.5in', height: '11in' });
  const a4 = Object.freeze({ width: '210mm', height: '297mm' });

  const supportsCustomPageSize = !!window.chrome && !!window.chrome.webstore;

  class PageSetup {
    constructor(opts = {}, printOpts = {}) {
      this.size = opts.size || defaultPageSetup.size;
      this.margin = opts.margin || defaultPageSetup.margin;
      this.markLength = '12pt';

      this.paper = supportsCustomPageSize ? (printOpts.paper || AUTO) : AUTO_MARKS;
      this.bleed = printOpts.bleed || defaultPageSetup.bleed;
      this.printTwoUp = printOpts.layout && printOpts.layout !== PAGES;
    }

    get displaySize() {
      const width = this.printTwoUp ? this.spreadSize.width : this.size.width;
      const height = this.size.height;
      const bleed = this.bleed;

      return { width, height, bleed };
    }

    get sheetSize() {
      const width = this.printTwoUp ? this.spreadSize.width : this.size.width;
      const height = this.size.height;

      const bleedAmount = `2 * ${this.bleed}`;
      const marksAmount = `2 * ${this.bleed} + 2 * ${this.markLength}`;
      switch (this.paper) {
      case AUTO:
        return { width, height };
      case AUTO_BLEED:
        return {
          width: `calc(${width} + ${bleedAmount})`,
          height: `calc(${height} + ${bleedAmount})`,
        };
      case AUTO_MARKS:
        return {
          width: `calc(${width} + ${marksAmount})`,
          height: `calc(${height} + ${marksAmount})`,
        };
      case LETTER_LANDSCAPE:
        return { width: letter.height, height: letter.width };
      case LETTER_PORTRAIT:
        return letter;
      case A4_PORTRAIT:
        return a4;
      case A4_LANDSCAPE:
        return { width: a4.height, height: a4.width };
      default:
      }
      return { width, height };
    }

    get spreadSize() {
      const w = parseLength(this.size.width);
      return {
        height: this.size.height,
        width: `${w.val * 2}${w.unit}`,
      };
    }

    updateStyleVars() {
      const page = this.size;
      const sheet = this.sheetSize;
      const vars = {
        'spread-width': this.spreadSize.width,
        'page-width': page.width,
        'page-height': page.height,
        'sheet-width': sheet.width,
        'sheet-height': sheet.height,
        'margin-inner': this.margin.inner,
        'margin-outer': this.margin.outer,
        'margin-top': this.margin.top,
        'margin-bottom': this.margin.bottom,
        bleed: this.bleed,
        'mark-length': this.markLength,
      };
      const str = Object.keys(vars).map(k => `--bindery-${k}: ${vars[k]};`).join('');

      const rootRule = `:root { ${str} }`;
      const pageRule = `@page { size: ${sheet.width} ${sheet.height}; }`;

      stylesheet('binderyPage').innerHTML = `${rootRule} ${pageRule}`;
    }
  }

  class Rule {
    constructor(options) {
      this.name = options.name ? options.name : 'Unnamed Bindery Rule';
      this.selector = '';

      Object.keys(options).forEach((key) => {
        this[key] = options[key];
      });
    }
  }

  const validate = (opts, validOpts) => {
    if (!validOpts) throw Error('Valid options not specified');

    Object.keys(opts).forEach((k) => {
      if (!validOpts[k]) {
        const setName = validOpts.name ? `'${validOpts.name}'` : 'This option';
        throw Error(`Unknown option in ${setName}: '${k}'`);
      }
      const val = opts[k];
      const type = validOpts[k];
      if (!type.check(val)) {
        const optName = validOpts.name ? `${validOpts.name}.${k}` : k;
        throw Error(`Invalid value for '${optName}': ${JSON.stringify(val)} is not a ${type.name}.`);
      }
    });
    return true;
  };

  const isObj = val => typeof val === 'object';
  const isFunc = val => typeof val === 'function';
  const isBool = val => typeof val === 'boolean';
  const isStr = val => typeof val === 'string';
  const isArr = val => Array.isArray(val);

  const hasProp = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);

  const hasSameKeys = (opts, required) => {
    const keys = Object.keys(required).filter(k => k !== 'name');
    return !keys.some(k => !hasProp(opts, k));
  };

  const isShape = template => input => isObj(input) && validate(input, template);

  const isShapeExact = template => input => isObj(input)
    && hasSameKeys(input, template)
    && validate(input, template);

  const isEnum = cases => str => cases.includes(str);

  const T = {
    any: {
      name: 'any',
      check: () => true,
    },
    enum(...cases) {
      return {
        name: `(${cases.map(c => `"${c}"`).join(' | ')})`,
        check: isEnum(cases),
      };
    },
    shapeExact: template => ({
      name: `exactly ({${Object.keys(template).join(', ')}})`,
      check: isShapeExact(template),
    }),
    shape: template => ({
      name: `shape ({${Object.keys(template).join(', ')}})`,
      check: isShape(template),
    }),
    string: {
      name: 'string',
      check: isStr,
    },
    length: {
      name: 'length (string with absolute units)',
      check: isLength,
    },
    bool: {
      name: 'bool',
      check: isBool,
    },
    func: {
      name: 'func',
      check: isFunc,
    },
    obj: {
      name: 'object',
      check: isObj,
    },
    array: {
      name: 'array',
      check: isArr,
    },
  };

  T.margin = {
    name: 'margin ({ top, inner, outer, bottom })',
    check: isShapeExact({
      name: 'margin',
      top: T.length,
      inner: T.length,
      outer: T.length,
      bottom: T.length,
    }),
  };

  T.size = {
    name: 'size ({ width, height })',
    check: isShapeExact({
      name: 'size',
      width: T.length,
      height: T.length,
    }),
  };

  class Counter extends Rule {
    constructor(options) {
      super(options);
      this.selector = '*';
      this.counterValue = 0;
      validate(options, {
        name: 'Counter',
        replaceEl: T.string,
        resetEl: T.string,
        incrementEl: T.string,
        replace: T.func,
      });
    }
    setup() {
      this.counterValue = 0;
    }
    beforeAdd(el) {
      if (el.matches(this.incrementEl)) this.counterValue += 1;
      if (el.matches(this.resetEl)) this.counterValue = 0;
      if (el.matches(this.replaceEl)) return this.createReplacement(el);
      return el;
    }
    createReplacement(element) {
      return this.replace(element, this.counterValue);
    }
    replace(element, counterValue) {
      element.textContent = counterValue;
      return element;
    }
  }

  class OutOfFlow extends Rule {
    constructor(options) {
      super(options);
      this.name = 'Out of Flow';
    }
    beforeAdd(elmt) {
      // Avoid breaking inside this element. Once it's completely added,
      // it will moved onto the background layer.

      elmt.setAttribute('data-ignore-overflow', true);
      return elmt;
    }
    afterAdd(elmt, book, continueOnNewPage, makeNewPage) {
      this.createOutOfFlowPages(elmt, book, makeNewPage);

      // Catches cases when we didn't need to create a new page. but unclear
      if (this.continue !== 'same' || book.currentPage.hasOutOfFlowContent) {
        continueOnNewPage(true);
        if (this.continue === 'left' || this.continue === 'right') {
          book.currentPage.setPreference(this.continue);
        }
      }

      return elmt;
    }
  }

  // Options:
  // selector: String

  class FullBleedSpread extends OutOfFlow {
    constructor(options) {
      options.continue = options.continue || 'same';
      options.rotate = options.rotate || 'none';
      super(options);
      validate(options, {
        name: 'FullBleedSpread',
        selector: T.string,
        continue: T.enum('next', 'same', 'left', 'right'),
        rotate: T.enum('none', 'clockwise', 'counterclockwise'),
      });
    }
    createOutOfFlowPages(elmt, book, makeNewPage) {
      elmt.parentNode.removeChild(elmt);

      let leftPage;
      if (book.currentPage.isEmpty) {
        leftPage = book.currentPage;
      } else {
        leftPage = makeNewPage();
        book.pages.push(leftPage);
      }

      const rightPage = makeNewPage();
      book.pages.push(rightPage);

      if (this.rotate !== 'none') {
        [leftPage, rightPage].forEach((page) => {
          const rotateContainer = createEl(`.rotate-container.spread-size-rotated.rotate-spread-${this.rotate}`);
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
  }

  // Options:
  // selector: String

  class FullBleedPage extends OutOfFlow {
    constructor(options) {
      options.continue = options.continue || 'same';
      options.rotate = options.rotate || 'none';
      super(options);
      validate(options, {
        name: 'FullBleedPage',
        selector: T.string,
        continue: T.enum('next', 'same', 'left', 'right'),
        rotate: T.enum('none', 'inward', 'outward', 'clockwise', 'counterclockwise'),
      });
    }

    createOutOfFlowPages(elmt, book, makeNewPage) {
      elmt.parentNode.removeChild(elmt);

      let newPage;
      if (book.currentPage.isEmpty) {
        newPage = book.currentPage;
      } else {
        newPage = makeNewPage();
        book.pages.push(newPage);
      }
      if (this.rotate !== 'none') {
        const rotateContainer = createEl(`.rotate-container.page-size-rotated.rotate-${this.rotate}`);
        rotateContainer.appendChild(newPage.background);
        newPage.element.appendChild(rotateContainer);
      }
      newPage.background.appendChild(elmt);
      newPage.hasOutOfFlowContent = true;
    }
  }

  // Options:
  // selector: String
  // replace: function (HTMLElement) => HTMLElement

  class Replace extends Rule {
    constructor(options) {
      super(options);
      this.name = 'Replace';
    }
    afterAdd(element, book, continueOnNewPage, makeNewPage, overflowCallback) {
      const parent = element.parentNode;
      if (!parent) {
        console.error(element);
        throw Error(`Bindery.Replace({ selector: '${this.selector}' }).afterAdd called on element that hasn't been added.`);
      }
      const defensiveClone = element.cloneNode(true);
      const replacement = this.createReplacement(book, defensiveClone);
      parent.replaceChild(replacement, element);

      if (book.currentPage.hasOverflowed()) {
        parent.replaceChild(element, replacement);

        return overflowCallback(element);
      }

      return replacement;
    }
    createReplacement(book, element) {
      return this.replace(element);
    }
    replace(element) {
      element.insertAdjacentHTML('beforeEnd', '<sup class="bindery-sup">Default Replacement</sup>');
      return element;
    }
  }

  // Options:
  // selector: String
  // replace: function (HTMLElement, number) => HTMLElement
  // render: function (Page) => HTMLElement

  class Footnote extends Replace {
    constructor(options) {
      super(options);
      validate(options, {
        name: 'Footnote',
        selector: T.string,
        replace: T.func,
        render: T.func,
      });
    }
    afterAdd(element, book, continueOnNewPage, makeNewPage, overflowCallback) {
      const number = book.currentPage.footer.children.length + 1;

      const footnote = createEl('.footnote');
      const contents = this.render(element, number);
      if (contents instanceof HTMLElement) footnote.appendChild(contents);
      else footnote.innerHTML = contents;

      book.currentPage.footer.appendChild(footnote);

      return super.afterAdd(element, book, continueOnNewPage, makeNewPage, (overflowEl) => {
        book.currentPage.footer.removeChild(footnote);
        return overflowCallback(overflowEl);
      });
    }
    createReplacement(book, element) {
      const number = book.currentPage.footer.children.length;
      return this.replace(element, number);
    }
    replace(element, number) {
      element.insertAdjacentHTML('beforeEnd', `<sup class="bindery-sup">${number}</sup>`);
      return element;
    }
    render(element, number) {
      return `<sup>${number}</sup> Default footnote (<a href='/bindery/docs/#footnote'>Learn how to change it</a>)`;
    }
  }

  const pageNumbersForTest = (pages, test) =>
    pages.filter(pg => test(pg.element)).map(pg => pg.number);

  const formatAsRanges = (pageNumbers) => {
    let str = '';
    let prevNum = pageNumbers[0];
    let isInARange = false;

    const addFirst = (num) => {
      str += `${num}`;
    };
    const continueRange = () => {
      isInARange = true;
    };
    const endRange = (endNum) => {
      isInARange = false;
      str += `–${endNum}`;
    };
    const addComma = (num) => {
      str += `, ${num}`;
    };
    const endAndAdd = (endNum, num) => {
      endRange(endNum);
      addComma(num);
    };
    const addLast = (num, isAdjacent) => {
      if (isAdjacent) endRange(num);
      else if (isInARange && !isAdjacent) endAndAdd(prevNum, num);
      else addComma(num);
    };

    pageNumbers.forEach((num, i) => {
      const isLast = i === pageNumbers.length - 1;
      const isAdjacent = num === prevNum + 1;

      if (i === 0) addFirst(num);
      else if (isLast) addLast(num, isAdjacent);
      else if (isAdjacent) continueRange();
      else if (isInARange && !isAdjacent) endAndAdd(prevNum, num);
      else addComma(num);
      prevNum = num;
    });
    return str;
  };

  // https://github.com/moroshko/shallow-equal/blob/master/src/arrays.js
  const shallowEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;

    const len = a.length;

    if (b.length !== len) {
      return false;
    }

    for (let i = 0; i < len; i += 1) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  };

  const oncePerFrameLimiter = () => {
    let wasCalled = false;
    return (func) => {
      if (wasCalled) return;
      wasCalled = true;
      func();
      requestAnimationFrame(() => { wasCalled = false; });
    };
  };

  const oncePerTimeLimiter = (time) => {
    let wasCalled = false;
    return (func) => {
      if (wasCalled) return;
      wasCalled = true;
      func();
      setTimeout(() => { wasCalled = false; }, time);
    };
  };

  // Options:
  // selector: String
  // replace: function (HTMLElement, number) => HTMLElement
  class PageReference extends Replace {
    constructor(options) {
      super(options);
      validate(options, {
        name: 'PageReference',
        selector: T.string,
        replace: T.func,
        createTest: T.func,
      });
      this.references = [];
      const throttle = oncePerFrameLimiter();
      this.throttledUpdate = (book) => {
        throttle(() => this.updatePageReferences(book.pages));
      };
    }

    eachPage(page, book) {
      this.throttledUpdate(book);
    }

    afterAdd(elmt, book) {
      const test = this.createTest(elmt);
      if (!test) return elmt;

      const ref = this.createReference(book, test, elmt);
      return ref.element;
    }

    createReference(book, test, elmt) {
      const ref = { test, template: elmt, element: elmt, value: null };
      const render = newValue => this.render(ref, newValue);
      ref.render = render;
      this.references.push(ref);
      const currentResults = pageNumbersForTest(book.pages, test);
      ref.render(currentResults); // Replace element immediately, to make sure it'll fit
      return ref;
    }

    render(ref, newValue) {
      if (!newValue || shallowEqual(ref.value, newValue)) return;
      if (!Array.isArray(newValue)) throw Error('Page search returned unexpected result');

      const isResolved = newValue.length > 0;
      const pageRanges = isResolved ? formatAsRanges(newValue) : '?';

      const template = ref.template.cloneNode(true);
      const newRender = this.replace(template, pageRanges);
      if (!isResolved) newRender.classList.add(c('placeholder-pulse'));
      ref.element.parentNode.replaceChild(newRender, ref.element);

      ref.element = newRender;
      ref.value = newValue;
    }

    createTest(element) {
      const href = element.getAttribute('href');
      if (!href) return null;
      const selector = `[id="${href.replace('#', '')}"]`;
      return el => el.querySelector(selector);
    }

    updatePageReferences(pages) {
      // querySelector first, then rerender
      const results = this.references.map(ref => pageNumbersForTest(pages, ref.test));
      this.references.forEach((ref, i) => this.render(ref, results[i]));
    }

    replace(template, number) {
      template.insertAdjacentHTML('beforeend', `, <span>${number}</span>`);
      return template;
    }
  }

  class PageBreak extends Rule {
    constructor(options) {
      options.position = options.position || 'before';
      options.continue = options.continue || 'next';
      super(options);

      validate(options, {
        name: 'PageBreak',
        selector: T.string,
        continue: T.enum('next', 'left', 'right'),
        position: T.enum('before', 'after', 'both', 'avoid'),
      });
    }
    get avoidSplit() {
      return this.position === 'avoid';
    }
    beforeAdd(elmt, book, continueOnNewPage) {
      if (this.position === 'before' || this.position === 'both') {
        if (!book.currentPage.isEmpty) {
          continueOnNewPage();
        }
        if (this.continue !== 'next') {
          book.currentPage.setPreference(this.continue);
        }
      }
      return elmt;
    }
    afterAdd(elmt, book, continueOnNewPage) {
      if (this.position === 'after' || this.position === 'both') {
        const newPage = continueOnNewPage(true);
        if (this.continue !== 'next') {
          newPage.setPreference(this.continue);
        }
      }
      return elmt;
    }
  }

  // Options:
  // selector: String
  // render: function (Page) => HTMLElement
  // TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

  class RunningHeader extends Rule {
    constructor(options = {}) {
      super(options);
      validate(options, {
        name: 'RunningHeader',
        render: T.func,
      });
    }
    eachPage(page) {
      if (!page.runningHeader) {
        const elmt = createEl('.running-header');
        page.element.appendChild(elmt);
        page.runningHeader = elmt;
      }
      page.runningHeader.innerHTML = this.render(page);
    }
    render(page) {
      return page.number;
    }
  }

  class Split extends Rule {
    constructor(options) {
      super(options);

      validate(options, {
        name: 'Split',
        selector: T.string,
        toNext: T.string,
        fromPrevious: T.string,
        didSplit: T.func,
      });
    }

    didSplit(original, clone) {
      if (this.toNext) original.classList.add(this.toNext);
      if (this.fromPrevious) clone.classList.add(this.fromPrevious);
    }
  }

  var rules = {
    Rule,
    Split(options) {
      return new Split(options);
    },
    Counter(options) {
      return new Counter(options);
    },
    FullBleedPage(options) {
      return new FullBleedPage(options);
    },
    Footnote(options) {
      return new Footnote(options);
    },
    RunningHeader(options) {
      return new RunningHeader(options);
    },
    Replace(options) {
      return new Replace(options);
    },
    FullBleedSpread(options) {
      return new FullBleedSpread(options);
    },
    PageBreak(options) {
      return new PageBreak(options);
    },
    PageReference(options) {
      return new PageReference(options);
    },
    createRule(options) {
      return new Rule(options);
    },
  };

  const {
    PageBreak: PageBreak$1,
    PageReference: PageReference$1,
    Footnote: Footnote$1,
    FullBleedPage: FullBleedPage$1,
    FullBleedSpread: FullBleedSpread$1,
  } = rules;

  const replacer = (element, number) => {
    element.textContent = `${number}`;
    return element;
  };

  var attributeRules = [
    PageBreak$1({ selector: '[book-page-break="both"]', position: 'both' }),
    PageBreak$1({ selector: '[book-page-break="avoid"]', position: 'avoid' }),

    PageBreak$1({ selector: '[book-page-break="after"][book-page-continue="right"]', position: 'after', continue: 'right' }),
    PageBreak$1({ selector: '[book-page-break="after"][book-page-continue="left"]', position: 'after', continue: 'left' }),
    PageBreak$1({ selector: '[book-page-break="after"][book-page-continue="next"]', position: 'after', continue: 'next' }),

    PageBreak$1({ selector: '[book-page-break="before"][book-page-continue="right"]', position: 'before', continue: 'right' }),
    PageBreak$1({ selector: '[book-page-break="before"][book-page-continue="left"]', position: 'before', continue: 'left' }),
    PageBreak$1({ selector: '[book-page-break="before"][book-page-continue="next"]', position: 'before', continue: 'next' }),

    FullBleedPage$1({ selector: '[book-full-bleed="page"]' }),
    FullBleedSpread$1({ selector: '[book-full-bleed="spread"]' }),

    Footnote$1({
      selector: '[book-footnote-text]',
      render: (element, number) => {
        const txt = element.getAttribute('book-footnote-text');
        return `<i>${number}</i>${txt}`;
      },
    }),

    PageReference$1({
      selector: '[book-pages-with-text]',
      replace: replacer,
      createTest: (element) => {
        const term = element.getAttribute('book-pages-with-text').toLowerCase().trim();
        return page => page.textContent.toLowerCase().includes(term);
      },
    }),

    PageReference$1({
      selector: '[book-pages-with-selector]',
      replace: replacer,
      createTest: (element) => {
        const sel = element.getAttribute('book-pages-with-selector').trim();
        return page => page.querySelector(sel);
      },
    }),

    PageReference$1({
      selector: '[book-pages-with]',
      replace: replacer,
      createTest: (element) => {
        const term = element.textContent.toLowerCase().trim();
        return (page) => {
          const txt = page.textContent.toLowerCase();
          return txt.includes(term);
        };
      },
    }),
  ];

  /* 📖 Regionize v0.1.0 */
  const div = (cls) => {
    const el = document.createElement('div');
    el.classList.add(cls);
    return el;
  };

  class Region {
    constructor(elmt) {
      this.element = elmt;
      this.content = div('region-content');
      this.content.style.padding = '0.1px';
      this.content.style.position = 'relative';
      this.element.appendChild(this.content);
      this.path = [];
    }

    setPath(newPath) {
      this.path = newPath;
      if (newPath.length > 0) this.content.appendChild(newPath[0]);
    }

    get currentElement() {
      const len = this.path.length;
      if (len > 0) return this.path[len - 1];
      return this.content;
    }

    get isEmpty() {
      return this.content.textContent.trim() === '' && this.content.offsetHeight < 1;
    }

    get isReasonableSize() {
      const box = this.element.getBoundingClientRect();
      return (box.height > 100) && (box.width > 100); // TODO: Number is arbitrary
    }

    overflowAmount() {
      const contentH = this.content.offsetHeight;
      const boxH = this.element.offsetHeight;
      if (boxH === 0) throw Error('Regionizer: Trying to flow into an element with zero height.');
      return contentH - boxH;
    }

    hasOverflowed() {
      return this.overflowAmount() > -5;
    }
  }

  const isTextNode = node => node.nodeType === Node.TEXT_NODE;
  const isElement = node => node.nodeType === Node.ELEMENT_NODE;
  const isScript = node => node.tagName === 'SCRIPT';
  const isImage = node => node.tagName === 'IMG';
  const isUnloadedImage = node => isImage(node) && !node.naturalWidth;
  const isContentElement = node => isElement(node) && !isScript(node);

  const MAX_TIME = 30; // ms

  const rAF = () => new Promise((resolve) => {
    requestAnimationFrame(t => resolve(t));
  });

  let lastYieldTime = 0;

  const shouldYield = () => {
    const timeSinceYield = performance.now() - lastYieldTime;
    return timeSinceYield > MAX_TIME;
  };

  const yieldIfNecessary = async () => {
    if (shouldYield()) lastYieldTime = await rAF();
  };

  const overflowAttr = 'data-ignore-overflow';
  // Walk up the tree to see if we are within
  // an overflow-ignoring node
  const ignoreOverflow = (element) => {
    if (element.hasAttribute(overflowAttr)) return true;
    if (element.parentElement) return ignoreOverflow(element.parentElement);
    return false;
  };

  const createTextNode = (document.createTextNode).bind(document);

  // Try adding a text node in one go.
  // Returns true if all the text fits, false if none fits.
  const addTextNode = async (textNode, parent, hasOverflowed) => {
    parent.appendChild(textNode);
    const success = !hasOverflowed();
    if (!success) parent.removeChild(textNode);
    await yieldIfNecessary();
    return success;
  };


  // Try adding a text node by incrementally adding words
  // until it just barely doesnt overflow.
  //
  // Returns true if all the text fits, false if none fits,
  // or new textnode containing the remainder text.
  const addTextNodeUntilOverflow = async (textNode, parent, hasOverflowed) => {
    const originalText = textNode.nodeValue;
    parent.appendChild(textNode);

    if (!hasOverflowed() || ignoreOverflow(parent)) {
      return true;
    }

    // Add letter by letter until overflow
    let pos = 0;
    textNode.nodeValue = originalText.substr(0, pos);

    while (!hasOverflowed() && pos < originalText.length) {
      // advance to next non-space character
      pos += 1;
      while (pos < originalText.length && originalText.charAt(pos) !== ' ') pos += 1;

      if (pos < originalText.length) {
        // reveal more text
        textNode.nodeValue = originalText.substr(0, pos);
        await yieldIfNecessary();
      }
    }

    // Back out to word boundary
    if (originalText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
    while (originalText.charAt(pos) !== ' ' && pos > 0) pos -= 1;

    if (pos < 1) {
      // We didn't even add a complete word, don't add node
      textNode.nodeValue = originalText;
      parent.removeChild(textNode);
      return false; // TODO
    }

    // trim text to word
    const fittingText = originalText.substr(0, pos);
    const overflowingText = originalText.substr(pos);
    textNode.nodeValue = fittingText;

    // Create a new text node for the next flow box
    const remainingTextNode = createTextNode(overflowingText);
    return remainingTextNode;
  };


  // Fills text across multiple elements by requesting a continuation
  // once the current element overflows
  const addTextNodeAcrossParents = async (textNode, parent, nextParent, hasOverflowed) => {
    const result = await addTextNodeUntilOverflow(textNode, parent, hasOverflowed);
    if (isTextNode(result)) {
      const nextElement = nextParent();
      return addTextNodeAcrossParents(result, nextElement, nextParent, hasOverflowed);
    }
    return result;
  };

  // Shifts this element to the next page. If any of its
  // ancestors cannot be split across page, it will
  // step up the tree to find the first ancestor
  // that can be split, and move all of that descendants
  // to the next page.
  const tryInNextRegion = (region, makeNextRegion, canSplit) => {
    if (region.path.length <= 1) {
      throw Error('Bindery: Attempting to move the top-level element');
    }
    const startLength = region.path.length;

    // So this node won't get cloned. TODO: this is unclear
    const elementToMove = region.path.pop();

    // find the nearest splittable parent
    let nearestElementThatCanBeMoved = elementToMove;
    const pathToRestore = [];
    while (region.path.length > 1 && !canSplit(region.currentElement)) {
      nearestElementThatCanBeMoved = region.path.pop();
      pathToRestore.unshift(nearestElementThatCanBeMoved);
    }

    // Once a node is moved to a new page, it should no longer trigger another
    // move. otherwise tall elements will endlessly get shifted to the next page
    nearestElementThatCanBeMoved.setAttribute('data-bindery-did-move', true);

    const parent = nearestElementThatCanBeMoved.parentNode;
    parent.removeChild(nearestElementThatCanBeMoved);

    // If the nearest ancestor would be empty without this node,
    // move it to the next page too.
    if (region.path.length > 1 && region.currentElement.textContent.trim() === '') {
      parent.appendChild(nearestElementThatCanBeMoved);
      nearestElementThatCanBeMoved = region.path.pop();
      pathToRestore.unshift(nearestElementThatCanBeMoved);
      nearestElementThatCanBeMoved.parentNode.removeChild(nearestElementThatCanBeMoved);
    }

    let nextRegion;
    if (!region.isEmpty) {
      if (region.hasOverflowed()) {
        // Recovery failed, maybe the box contains a large
        // unsplittable element.
        region.suppressErrors = true;
      }
      nextRegion = makeNextRegion();
    } else {
      // If the page is empty when this node is removed,
      // then it won't help to move it to the next page.
      // Instead continue here until the node is done.
      nextRegion = region;
    }

    // append moved node as first in new page
    nextRegion.currentElement.appendChild(nearestElementThatCanBeMoved);

    // restore subpath
    pathToRestore.forEach(r => nextRegion.path.push(r));
    nextRegion.path.push(elementToMove);

    if (startLength !== nextRegion.path.length) {
      throw Error('Restored flowpath depth does not match original depth');
    }
  };

  // The path is an array of nested elments,
  // for example .content > article > p > a).
  //
  // It's shallowly cloned every time we move to the next page,
  // to create the illusion that nodes are continuing from page
  // to page.
  //
  // The transition can be customized by setting a Split rule,
  // which lets you add classes to the original and cloned element
  // to customize styling.

  const clonePath = (oldPath, applyRules) => {
    const newPath = [];

    const deepClone = (el) => {
      const clone = el.cloneNode(true); // deep clone, could be th > h3 > span;
      applyRules(el, clone);
      return clone;
    };

    for (let i = oldPath.length - 1; i >= 0; i -= 1) {
      const original = oldPath[i];
      const clone = original.cloneNode(false); // shallow
      const nextChild = oldPath[i + 1];
      clone.innerHTML = '';

      applyRules(original, clone, nextChild, deepClone);

      if (i < oldPath.length - 1) clone.appendChild(newPath[i + 1]);
      newPath[i] = clone;
    }

    return newPath;
  };

  // Polls every 10ms for image.naturalWidth
  // or an error event.
  //
  // Note: Doesn't ever reject, since missing images
  // shouldn't prevent layout from resolving

  const wait10 = () => new Promise((resolve) => {
    setTimeout(() => { resolve(); }, 10);
  });

  const ensureImageLoaded = async (image) => {
    const imgStart = performance.now();
    let failed = false;
    image.addEventListener('error', () => { failed = true; });
    image.src = image.src; // re-trigger error if already failed

    while (!image.naturalWidth && !failed) {
      await wait10();
    }

    return performance.now() - imgStart;
  };

  // flow content through FlowBoxes.
  // This function is not book-specific,
  // the caller is responsible for managing
  // and creating boxes.
  const flowIntoRegions = async (
    content,
    createRegion,
    applySplit,
    canSplit,
    beforeAdd,
    afterAdd
  ) => {
    let currentRegion = createRegion();
    const hasOverflowed = () => currentRegion.hasOverflowed();
    const canSplitCurrent = () => canSplit(currentRegion.currentElement);
    const ignoreCurrentOverflow = () => ignoreOverflow(currentRegion.currentElement);

    const continueInNextRegion = () => {
      const oldBox = currentRegion;
      currentRegion = createRegion();

      const newPath = clonePath(oldBox.path, applySplit);
      currentRegion.setPath(newPath);
      return currentRegion;
    };

    const continuedElement = () => {
      continueInNextRegion();
      return currentRegion.currentElement;
    };

    const addTextWithoutChecks = (textNode, parent) => {
      parent.appendChild(textNode);
      if (!ignoreCurrentOverflow() && canSplitCurrent()) {
        currentRegion.suppressErrors = true;
        continueInNextRegion();
      }
    };

    const addSplittableTextNode = async (textNode) => {
      const el = currentRegion.currentElement;
      let hasAdded = await addTextNodeAcrossParents(textNode, el, continuedElement, hasOverflowed);
      if (!hasAdded && currentRegion.path.length > 1) {
        // retry 1
        tryInNextRegion(currentRegion, continueInNextRegion, canSplit);
        hasAdded = await addTextNodeAcrossParents(textNode, el, continuedElement, hasOverflowed);
      }
      if (!hasAdded) {
        // retry 2
        addTextWithoutChecks(textNode, currentRegion.currentElement);
      }
    };

    const addWholeTextNode = async (textNode) => {
      let hasAdded = await addTextNode(textNode, currentRegion.currentElement, hasOverflowed);
      if (!hasAdded && !ignoreCurrentOverflow()) {
        // retry 1
        tryInNextRegion(currentRegion, continueInNextRegion, canSplit);
        hasAdded = await addTextNode(textNode, currentRegion.currentElement, hasOverflowed);
      }
      if (!hasAdded) {
        // retry 2
        addTextWithoutChecks(textNode, currentRegion.currentElement);
      }
    };

    let safeAddElementNode;

    // Adds an element node by clearing its childNodes, then inserting them
    // one by one recursively until they overflow the region
    const addElementNode = async (element) => {
      // Insert element
      currentRegion.currentElement.appendChild(element);
      currentRegion.path.push(element);

      // Clear element
      const childNodes = [...element.childNodes];
      element.innerHTML = '';

      // Overflows when empty
      if (hasOverflowed() && !ignoreCurrentOverflow() && canSplitCurrent()) {
        tryInNextRegion(currentRegion, continueInNextRegion, canSplit);
      }

      const shouldSplit = canSplit(element) && !ignoreOverflow(element);

      for (const child of childNodes) {
        if (isTextNode(child)) {
          await (shouldSplit ? addSplittableTextNode : addWholeTextNode)(child);
        } else if (isContentElement(child)) {
          await safeAddElementNode(child);
        }
      }
      return currentRegion.path.pop();
    };

    safeAddElementNode = async (element) => {
      // Ensure images are loaded before measuring
      if (isUnloadedImage(element)) await ensureImageLoaded(element);

      // Transforms before adding
      beforeAdd(element, continueInNextRegion);

      const addedElement = await addElementNode(element);

      // Transforms after adding
      afterAdd(addedElement, continueInNextRegion);
    };

    return safeAddElementNode(content);
  };

  const MAXIMUM_PAGE_LIMIT = 2000;

  class Book {
    constructor() {
      this.pages = [];
    }

    get pageCount() {
      return this.pages.length;
    }

    validate() {
      if (this.pageCount > MAXIMUM_PAGE_LIMIT) {
        throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
      }
    }
  }

  class Page {
    constructor() {
      this.flow = new Region(createEl('flow-box'));
      this.footer = createEl('footer');
      this.background = createEl('page-background');
      this.element = createEl('page', [this.background, this.flow.element, this.footer]);
    }

    static isSizeValid() {
      const testPage = new Page();
      return safeMeasure(testPage.element, () => testPage.flow.isReasonableSize);
    }

    setLeftRight(dir) {
      const isLeft = dir === 'left';
      this.side = dir;
      this.element.classList.toggle(classes.leftPage, isLeft);
      this.element.classList.toggle(classes.rightPage, !isLeft);
    }
    get isLeft() {
      return this.side === 'left';
    }

    get isRight() {
      return this.side === 'right';
    }

    setPreference(dir) {
      const isLeft = dir === 'left';
      this.alwaysLeft = isLeft;
      this.alwaysRight = !isLeft;
    }

    get suppressErrors() {
      return this.suppress || false;
    }

    set suppressErrors(newVal) {
      this.suppress = newVal;
      this.element.classList.toggle(classes.isOverflowing, newVal);
    }

    get isEmpty() {
      return !this.hasOutOfFlowContent && this.flow.isEmpty;
    }

    validate() {
      if (!this.hasOverflowed()) return;
      const suspect = this.currentElement;
      if (suspect) {
        console.warn('Bindery: Content overflows, probably due to a style set on:', suspect);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.warn('Bindery: Content overflows.');
      }
    }

    validateEnd(allowOverflow) {
      if (!this.hasOverflowed()) return;
      console.warn(`Bindery: Page ~${this.number} is overflowing`, this.element);
      if (!this.suppressErrors && !allowOverflow) {
        throw Error('Bindery: Moved to new page when last one is still overflowing');
      }
    }

    hasOverflowed() {
      return safeMeasure(this.element, () => this.flow.hasOverflowed());
    }
  }

  const indexOfNextInFlowPage = (pages, startIndex) => {
    for (let i = startIndex; i < pages.length; i += 1) {
      if (!pages[i].isOutOfFlow) return i;
    }
    return startIndex;
  };

  // Given an array of pages with alwaysLeft, alwaysRight, and isOutOfFlow
  // properties, orders them so that alwaysLeft and alwaysRight are true.

  const orderPages = (pages, makeNewPage) => {
    const orderedPages = pages.slice();

    for (let i = 0; i < orderedPages.length; i += 1) {
      const page = orderedPages[i];
      const isLeft = i % 2 !== 0;

      if ((isLeft && page.alwaysRight) || (!isLeft && page.alwaysLeft)) {
        if (page.isOutOfFlow) {
          // If the page is 'out of flow', we'd prefer not to add a blank page.
          // Instead it floats backwards in the book, pulling the next
          // in-flow page forward. If several 'out of flow' pages
          // are next to each other, they will remain in order, all being pushed
          // backward together.

          const indexToSwap = indexOfNextInFlowPage(orderedPages, i + 1);
          const pageToMoveUp = orderedPages[indexToSwap];
          orderedPages.splice(indexToSwap, 1);
          orderedPages.splice(i, 0, pageToMoveUp);
        } else {
          // If the page is 'in flow', order must be respected, so extra blank pages
          // are inserted.

          orderedPages.splice(i, 0, makeNewPage());
        }
      }
    }
    return orderedPages;
  };

  const annotatePages = (pages) => {
    {
      pages.forEach((page, i) => {
        page.number = i + 1;
        page.setLeftRight((i % 2 === 0) ? 'right' : 'left');
      });
    }

    // ———
    // RUNNING HEADERS

    // Sections to annotate with.
    // This should be a hierarchical list of selectors.
    // Every time one is selected, it annotates all following pages
    // and clears any subselectors.
    // TODO: Make this configurable
    const running = { h1: '', h2: '', h3: '', h4: '', h5: '', h6: '' };

    pages.forEach((page) => {
      page.heading = {};
      Object.keys(running).forEach((tagName, i) => {
        const element = page.element.querySelector(tagName);
        if (element) {
          running[tagName] = element.textContent;
          // clear remainder
          Object.keys(running).forEach((tag, j) => {
            if (j > i) running[tag] = '';
          });
        }
        if (running[tagName] !== '') {
          page.heading[tagName] = running[tagName];
        }
      });
    });
  };

  const isSpread = rule => rule instanceof FullBleedSpread;
  const isPage = rule => rule instanceof FullBleedPage;
  const isBreak = rule => rule instanceof PageBreak;

  const isFullPageRule = rule => isSpread(rule) || isPage(rule) || isBreak(rule);

  const dedupe = (inputRules) => {
    const conflictRules = inputRules.filter(isFullPageRule);
    const output = inputRules.filter(rule => !conflictRules.includes(rule));

    const firstSpreadRule = conflictRules.find(isSpread);
    const firstPageRule = conflictRules.find(isPage);

    // Only apply one fullpage or fullspread
    if (firstSpreadRule) output.push(firstSpreadRule);
    else if (firstPageRule) output.push(firstPageRule);
    else output.push(...conflictRules); // but multiple pagebreaks are ok

    return output;
  };

  // TODO:
  // While this does catch overflows, it is pretty hacky to move the entire node to the next page.
  // - 1. there is no guarentee it will fit on the new page
  // - 2. if it had childNodes, those side effects will not be undone,
  // which means footnotes will get left on previous page.
  // - 3. if it is a large paragraph, it will leave a large gap. the
  // ideal approach would be to only need to invalidate the last line of text.
  const recoverFromRule = (el, book, nextBox) => {
    let removed = el;
    const parent = el.parentNode;
    parent.removeChild(removed);
    let popped;
    if (book.currentPage.hasOverflowed()) {
      parent.appendChild(el);
      removed = parent;
      removed.parentNode.removeChild(removed);
      popped = book.currentPage.flow.path.pop();
      if (book.currentPage.hasOverflowed()) {
        console.error('Trying again didnt fix it');
      }
    }
    const newBox = nextBox();
    newBox.currentElement.appendChild(removed);
    if (popped) newBox.path.push(popped);
  };

  const giveUp = (rule, el) => {
    console.warn(`Couldn't apply ${rule.name}, caused overflows twice when adding: `, el);
  };

  class RuleSet {
    constructor(rules) {
      // Rules for pages
      this.pageRules = rules.filter(r => r.eachPage);

      // Rules for elements
      this.beforeAddRules = rules.filter(r => r.selector && r.beforeAdd);
      this.afterAddRules = rules.filter(r => r.selector && r.afterAdd);

      // Rules for layout
      this.selectorsNotToSplit = rules.filter(r => r.avoidSplit).map(r => r.selector);
      this.didSplitRules = rules.filter(r => r.selector && r.didSplit);

      // setup
      rules.filter(r => r.setup).forEach(r => r.setup());

      this.applySplitRules = this.applySplitRules.bind(this);
    }

    applySplitRules(original, clone, nextChild, deepClone) {
      original.classList.add(classes.toNext);
      clone.classList.add(classes.fromPrev);

      this.didSplitRules.filter(r => original.matches(r.selector)).forEach((rule) => {
        rule.didSplit(original, clone, nextChild, deepClone);
      });
    }

    // Rules for pages
    applyPageDoneRules(pg, book) {
      this.pageRules.forEach(rule => rule.eachPage(pg, book));
    }
    finishEveryPage(book) {
      this.pageRules.forEach(rule => book.pages.forEach(pg => rule.eachPage(pg, book)));
    }

    // Rules for elements
    applyBeforeAddRules(element, book, continueOnNewPage, makeNewPage) {
      let addedElement = element;

      const matchingRules = this.beforeAddRules.filter(rule => addedElement.matches(rule.selector));

      matchingRules.forEach((rule) => {
        addedElement = rule.beforeAdd(addedElement, book, continueOnNewPage, makeNewPage);
      });
      return addedElement;
    }

    applyAfterAddRules(originalElement, book, continueOnNewPage, makeNewPage) {
      let addedElement = originalElement;

      const attemptRecovery = el => recoverFromRule(el, book, continueOnNewPage);
      const matchingRules = this.afterAddRules.filter(rule => addedElement.matches(rule.selector));
      const uniqueRules = dedupe(matchingRules);

      uniqueRules.forEach((rule) => {
        const retry = (el) => {
          attemptRecovery(el);
          return rule.afterAdd(el, book, continueOnNewPage, makeNewPage, () => giveUp(rule, el));
        };
        addedElement = rule.afterAdd(addedElement, book, continueOnNewPage, makeNewPage, retry);
      });
      return addedElement;
    }
  }

  const sec = ms => (ms / 1000).toFixed(2);

  const estimateFor = (content) => {
    const start = window.performance.now();
    const capacity = content.querySelectorAll('*').length;
    const timeWaiting = 0;
    let completed = 0;

    return {
      increment: () => { completed += 1; },
      get progress() { return completed / capacity; },
      end: () => {
        const end = window.performance.now();
        const total = end - start;
        const layout = total - timeWaiting;
        console.log(`📖 Layout ready in ${sec(layout)}s (Waiting for images: ${sec(timeWaiting)}s)`);
      },
    };
  };

  const makeBook = async (content, rules, updateProgress) => {
    if (!Page.isSizeValid()) throw Error('Page is too small');

    const estimator = estimateFor(content);
    const ruleSet = new RuleSet(rules);
    const book = new Book();

    const makeNewPage = () => new Page();

    const finishPage = (page, allowOverflow) => {
      // finished with this page, can display
      book.pages = orderPages(book.pages, makeNewPage);
      annotatePages(book.pages);
      ruleSet.applyPageDoneRules(page, book);
      page.validateEnd(allowOverflow);
      book.validate();
    };

    const addPageToBook = (allowOverflow = false) => {
      const oldPage = book.currentPage;
      if (oldPage) finishPage(oldPage, allowOverflow);

      const newPage = makeNewPage();
      book.currentPage = newPage;
      book.pages.push(newPage);

      updateProgress(book, estimator.progress);
      newPage.validate();
      return newPage;
    };

    const makeNextRegion = () => {
      const newPage = addPageToBook();
      return newPage.flow;
    };

    const applySplit = ruleSet.applySplitRules;
    const dontSplitSel = ruleSet.selectorsNotToSplit;
    const canSplit = (element) => {
      if (dontSplitSel.some(sel => element.matches(sel))) {
        return false;
      }
      if (element.parentElement) return canSplit(element.parentElement, dontSplitSel);
      return true;
    };

    const beforeAdd = (elementToAdd, continueInNextRegion) => {
      ruleSet.applyBeforeAddRules(elementToAdd, book, continueInNextRegion, makeNewPage);
    };

    const afterAdd = (addedElement, continueInNextRegion) => {
      estimator.increment();
      return ruleSet.applyAfterAddRules(addedElement, book, continueInNextRegion, makeNewPage);
    };

    // init
    content.style.margin = 0;
    content.style.padding = 0;

    await flowIntoRegions(content, makeNextRegion, applySplit, canSplit, beforeAdd, afterAdd);

    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);

    ruleSet.finishEveryPage(book);
    estimator.end();
    return book;
  };

  const padPages = (pages, makePage) => {
    if (pages.length % 2 !== 0) {
      const pg = makePage();
      pages.push(pg);
    }
    const spacerPage = makePage();
    const spacerPage2 = makePage();
    spacerPage.element.style.visibility = 'hidden';
    spacerPage2.element.style.visibility = 'hidden';
    pages.unshift(spacerPage);
    pages.push(spacerPage2);

    return pages;
  };

  const twoPageSpread = children => createEl('.spread-wrapper.spread-size', children);
  const onePageSpread = children => createEl('.spread-wrapper.page-size', children);

  const renderGridLayout = (bookPages, isTwoUp) => {
    const pages = isTwoUp ? padPages(bookPages, () => new Page()) : bookPages;

    const gridLayout = document.createDocumentFragment();
    if (isTwoUp) {
      for (let i = 0; i < pages.length; i += 2) {
        const wrap = twoPageSpread([pages[i].element, pages[i + 1].element]);
        gridLayout.appendChild(wrap);
      }
    } else {
      pages.forEach((pg) => {
        const wrap = onePageSpread([pg.element]);
        gridLayout.appendChild(wrap);
      });
    }

    return gridLayout;
  };

  const directions = ['top', 'bottom', 'left', 'right'];
  const bleedMarks = () => directions.map(dir => createEl(`.mark-bleed-${dir}`));
  const cropMarks = () => directions.map(dir => createEl(`.mark-crop-${dir}`));

  const printMarksSingle = () => createEl('.print-mark-wrap', [
    ...cropMarks(), ...bleedMarks(),
  ]);

  const printMarksSpread = () => createEl('.print-mark-wrap', [
    createEl('.mark-crop-fold'), ...cropMarks(), ...bleedMarks(),
  ]);

  const bookletMeta = (i, len) => {
    const isFront = i % 4 === 0;
    const sheetIndex = parseInt((i + 1) / 4, 10) + 1;
    return createEl('.print-meta', `Sheet ${sheetIndex} of ${len / 4}: ${isFront ? 'Outside' : 'Inside'}`);
  };

  const orderPagesBooklet = (pages, makePage) => {
    while (pages.length % 4 !== 0) {
      const spacerPage = makePage();
      spacerPage.element.style.visibility = 'hidden';
      pages.push(spacerPage);
    }
    const bookletOrder = [];
    const len = pages.length;

    for (let i = 0; i < len / 2; i += 2) {
      bookletOrder.push(pages[len - 1 - i]);
      bookletOrder.push(pages[i]);
      bookletOrder.push(pages[i + 1]);
      bookletOrder.push(pages[len - 2 - i]);
    }

    return bookletOrder;
  };

  const twoPageSpread$1 = children => createEl('.spread-wrapper.spread-size', children);
  const onePageSpread$1 = children => createEl('.spread-wrapper.page-size', children);

  const renderPrintLayout = (bookPages, doubleSided, layout) => {
    const isTwoUp = layout !== PAGES;
    const isSpreads = layout === SPREADS;
    const isBooklet = layout === BOOKLET;

    let pages = bookPages;
    if (isSpreads) pages = padPages(pages, () => new Page());
    else if (isBooklet) pages = orderPagesBooklet(pages, () => new Page());

    const printLayout = document.createDocumentFragment();

    const marks = isTwoUp ? printMarksSpread : printMarksSingle;
    const spread = isTwoUp ? twoPageSpread$1 : onePageSpread$1;

    const printSheet = children => createEl('.print-sheet', [spread(children)]);

    if (isTwoUp) {
      for (let i = 0; i < pages.length; i += 2) {
        const spreadMarks = marks();
        if (isBooklet) {
          const meta = bookletMeta(i, pages.length);
          spreadMarks.appendChild(meta);
        }
        const sheet = printSheet([
          pages[i].element,
          pages[i + 1].element,
          spreadMarks]);
        printLayout.appendChild(sheet);
      }
    } else {
      pages.forEach((pg) => {
        const sheet = printSheet([pg.element, marks()]);
        printLayout.appendChild(sheet);
      });
    }

    return printLayout;
  };

  const renderFlipLayout = (bookPages, doubleSided) => {
    const pages = padPages(bookPages, () => new Page());

    const flipLayout = document.createDocumentFragment();
    const sizer = createEl('.spread-size.flip-sizer');
    const flapHolder = createEl('.spread-size.flap-holder');
    sizer.appendChild(flapHolder);
    flipLayout.appendChild(sizer);
    const flaps = [];
    let currentLeaf = -1;

    let leftOffset = 4;
    if (pages.length * leftOffset > 60) {
      leftOffset = 60 / pages.length;
    }
    flapHolder.style.width = `${pages.length * leftOffset}px`;

    const setLeaf = (n) => {
      let newLeaf = n;
      if (newLeaf === currentLeaf) newLeaf += 1;
      currentLeaf = newLeaf;

      let zScale = 4;
      if (flaps.length * zScale > 200) zScale = 200 / flaps.length;

      flaps.forEach((flap, i, arr) => {
        // + 0.5 so left and right are even
        const z = (arr.length - Math.abs((i - newLeaf) + 0.5)) * zScale;
        flap.style.transform = `translate3d(${(i < newLeaf) ? 4 : 0}px,0,${z}px) rotateY(${(i < newLeaf) ? -180 : 0}deg)`;
      });
    };

    let leafIndex = 0;
    for (let i = 1; i < pages.length - 1; i += (doubleSided ? 2 : 1)) {
      leafIndex += 1;
      const li = leafIndex;
      const flap = createEl('.page3d');
      flap.addEventListener('click', () => {
        const newLeaf = li - 1;
        setLeaf(newLeaf);
      });

      const rightPage = pages[i].element;
      let leftPage;
      rightPage.classList.add(c('page3d-front'));
      flap.appendChild(rightPage);
      if (doubleSided) {
        flap.classList.add(c('doubleSided'));
        leftPage = pages[i + 1].element;
      } else {
        leftPage = createEl('.page');
      }
      leftPage.classList.add(c('page3d-back'));
      flap.appendChild(leftPage);

      // TODO: Dynamically add/remove pages.
      // Putting 1000s of elements onscreen
      // locks up the browser.

      flap.style.left = `${i * leftOffset}px`;

      flaps.push(flap);
      flapHolder.appendChild(flap);
    }

    setLeaf(0);
    return flipLayout;
  };

  /* global BINDERY_VERSION */

  function errorView (title, text) {
    return createEl('.error', [
      createEl('.error-title', title),
      createEl('.error-text', text),
      createEl('.error-footer', `Bindery ${BINDERY_VERSION}`),
    ]);
  }

  const isCommandP = e => (e.ctrlKey || e.metaKey) && e.keyCode === 80;

  // Automatically switch into print mode
  const listenForPrint = (beforePrint) => {
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener((mql) => {
        if (mql.matches) {
          // before print
          beforePrint();
        }
      });
    }
    document.body.addEventListener('keydown', (e) => {
      if (isCommandP(e)) {
        e.preventDefault();
        beforePrint();
        setTimeout(() => window.print(), 200);
      }
    });
  };

  const throttleProgress = oncePerFrameLimiter();
  const throttleRender = oncePerTimeLimiter(100);
  const document$1 = window.document;

  class Viewer {
    constructor({ pageSetup, mode, layout, marks, ControlsComponent }) {
      this.book = null;
      this.pageSetup = pageSetup;

      this.progressBar = createEl('progress-bar');
      this.content = createEl('zoom-content');
      this.scaler = createEl('zoom-scaler', [this.content]);
      this.element = createEl('root', [this.progressBar, this.scaler]);

      this.doubleSided = true;
      this.layout = layout;

      this.setMarks(marks);
      this.mode = mode;
      this.element.classList.add(classes.viewPreview);
      this.currentLeaf = 0;

      listenForPrint(() => {
        this.mode = PRINT;
        this.render();
      });

      const throttleResize = oncePerTimeLimiter(50);
      window.addEventListener('resize', () => {
        throttleResize(() => this.scaleToFit());
      });

      if (ControlsComponent) {
        this.controls = new ControlsComponent(
          { Mode, Paper, Layout, Marks }, // Available options
          { // Initial props
            paper: this.pageSetup.paper,
            layout: this.layout,
            mode: this.mode,
            marks,
          },
          { // Actions
            setMode: this.setMode.bind(this),
            setPaper: this.setSheetSize.bind(this),
            setLayout: this.setLayout.bind(this),
            setMarks: this.setMarks.bind(this),
            getPageSize: () => this.pageSetup.displaySize,
          }
        );
        this.element.appendChild(this.controls.element);
      }

      this.inProgress = true;

      this.show();
    }

    setMode(newVal) {
      const newMode = parseInt(newVal, 10);
      if (newMode === this.mode) return;
      this.mode = newMode;
      this.render();
    }

    get inProgress() {
      return this.element.classList.contains(classes.inProgress);
    }
    set inProgress(newVal) {
      this.element.classList.toggle(classes.inProgress, newVal);
      if (newVal && this.controls) this.controls.setInProgress();
    }

    get isTwoUp() {
      return this.layout !== PAGES;
    }

    get isShowingCropMarks() {
      return this.element.classList.contains(classes.showCrop);
    }
    set isShowingCropMarks(newVal) {
      this.element.classList.toggle(classes.showCrop, newVal);
    }

    get isShowingBleedMarks() {
      return this.element.classList.contains(classes.showBleedMarks);
    }
    set isShowingBleedMarks(newVal) {
      this.element.classList.toggle(classes.showBleedMarks, newVal);
    }

    get isShowingBleed() {
      return this.element.classList.contains(classes.showBleed);
    }
    set isShowingBleed(newVal) {
      this.element.classList.toggle(classes.showBleed, newVal);
    }

    get isViewing() {
      return document$1.body.classList.contains(classes.isViewing);
    }
    set isViewing(newVal) {
      document$1.body.classList.toggle(classes.isViewing, newVal);
    }

    setSheetSize(str) {
      const newVal = parseInt(str, 10);

      this.pageSetup.paper = newVal;
      this.pageSetup.updateStyleVars();

      this.mode = PRINT;
      this.render();

      this.scaleToFit();
      setTimeout(() => { this.scaleToFit(); }, 300);
    }

    setLayout(str) {
      const newVal = parseInt(str, 10);

      if (newVal === this.layout) return;
      this.layout = newVal;

      this.pageSetup.printTwoUp = this.isTwoUp;
      this.pageSetup.updateStyleVars();

      this.mode = PRINT;
      this.render();
    }

    setMarks(str) {
      const newVal = parseInt(str, 10);
      this.isShowingCropMarks = (newVal === CROP || newVal === BOTH);
      this.isShowingBleedMarks = (newVal === BLEED || newVal === BOTH);
    }

    displayError(title, text) {
      this.show();
      if (!this.error) {
        this.error = errorView(title, text);
        this.element.appendChild(this.error);
        this.scrollToBottom();
        if (this.book) {
          const flow = this.book.currentPage.flow;
          if (flow) flow.currentElement.style.outline = '3px solid red';
        }
      }
    }
    scrollToBottom() {
      const scroll = document$1.scrollingElement;
      if (!scroll) return;
      const scrollMax = scroll.scrollHeight - scroll.offsetHeight;
      scroll.scrollTop = scrollMax;
    }
    clear() {
      this.book = null;
      this.lastSpreadInProgress = null; // TODO: Make this clearer, after first render
      this.content.innerHTML = '';
    }
    show() {
      if (this.element.parentNode) return;
      document$1.body.appendChild(this.element);
      this.isViewing = true;
    }
    hide() {
      // TODO this doesn't work if the target is an existing node
      if (!this.element.parentNode) return;
      this.element.parentNode.removeChild(this.element);
      this.isViewing = false;
    }
    render(newBook) {
      if (newBook) this.book = newBook;
      if (!this.book) return;
      this.show();

      this.element.classList.remove(...classes.allModes);
      this.element.classList.add(classes[this.mode]);
      this.isShowingBleed = this.mode === PRINT;

      const prevScroll = this.scrollPercent;

      if (this.controls) this.controls.setDone(this.book.pages.length);
      this.progress = 1;

      window.requestAnimationFrame(() => {
        const pages = this.book.pages.slice();
        const fragment = this.viewFor(this.mode)(pages, this.doubleSided, this.layout);
        this.content.innerHTML = '';
        this.content.appendChild(fragment);
        if (!this.hasRendered) this.hasRendered = true;
        else this.scrollPercent = prevScroll;

        this.scaleToFit();
      });
    }

    viewFor(mode) {
      if (mode === PREVIEW) return renderGridLayout;
      else if (mode === FLIPBOOK) return renderFlipLayout;
      else if (mode === PRINT) return renderPrintLayout;
      throw Error(`Invalid layout mode: ${this.mode} (type ${typeof this.mode})`);
    }

    set progress(p) {
      if (p < 1) {
        throttleProgress(() => {
          this.progressBar.style.transform = `scaleX(${p})`;
        });
      } else {
        this.progressBar.style.transform = '';
      }
    }
    updateProgress(book, estimatedProgress) {
      this.book = book;
      this.progress = estimatedProgress;

      if (!document$1 || !document$1.scrollingElement) return;
      // don't rerender if preview is out of view
      const scrollTop = document$1.scrollingElement.scrollTop;
      const scrollH = document$1.scrollingElement.scrollHeight;
      const h = document$1.scrollingElement.offsetHeight;
      if (scrollH > h * 3 && scrollTop < h) return;

      // don't rerender too often
      throttleRender(() => this.renderProgress(book, estimatedProgress));
    }

    renderProgress(book, estimatedProgress) {
      const needsZoomUpdate = !this.content.firstElementChild;

      if (this.controls) {
        this.controls.updateProgress(book.pageCount, estimatedProgress);
      }

      const sideBySide =
        this.mode === PREVIEW
        || (this.mode === PRINT && this.layout !== PAGES);
      const limit = sideBySide ? 2 : 1;

      const makeSpread = pgs => createEl('.spread-wrapper.spread-size', pgs);

      book.pages.forEach((page, i) => {
        if (this.content.contains(page.element) && page.element.parentNode !== this.content) return;
        if (this.lastSpreadInProgress && this.lastSpreadInProgress.children.length < limit) {
          this.lastSpreadInProgress.appendChild(page.element);
          return;
        }
        this.lastSpreadInProgress = makeSpread([page.element]);
        if (i === 0 && sideBySide) {
          const spacer = new Page();
          spacer.element.style.visibility = 'hidden';
          this.lastSpreadInProgress.insertBefore(
            spacer.element,
            this.lastSpreadInProgress.firstElementChild
          );
        }
        this.content.appendChild(this.lastSpreadInProgress);
      });

      if (needsZoomUpdate) this.scaleToFit();
    }

    scaleToFit() {
      if (!this.content.firstElementChild) return;
      const prevScroll = this.scrollPercent;
      this.scaler.style.transform = `scale(${this.scaleThatFits})`;
      this.scrollPercent = prevScroll;
    }

    get scaleThatFits() {
      const viewerW = this.scaler.getBoundingClientRect().width;
      const contentW = this.content.getBoundingClientRect().width;
      return Math.min(1, viewerW / contentW);
    }

    get scrollPercent() {
      if (!document$1 || !document$1.scrollingElement) return 0;
      const el = document$1.scrollingElement;
      return el.scrollTop / el.scrollHeight;
    }

    set scrollPercent(newVal) {
      if (!document$1 || !document$1.scrollingElement) return;
      const el = document$1.scrollingElement;
      el.scrollTop = el.scrollHeight * newVal;
    }
  }

  /* global BINDERY_VERSION */

  const vals = obj => Object.keys(obj).map(k => obj[k]);
  const rAF$1 = () => new Promise((resolve) => {
    requestAnimationFrame(t => resolve(t));
  });

  class Bindery {
    constructor(opts = {}) {
      console.log(`📖 Bindery ${BINDERY_VERSION}`);

      if (!opts.content) {
        this.viewer.displayError('Content not specified', 'You must include a source element, selector, or url');
        throw Error('Bindery: You must include a source element or selector');
      }

      this.autorun = opts.autorun || true;
      this.autoupdate = opts.autoupdate || false;

      validate(opts, {
        name: 'makeBook',
        autorun: T.bool,
        content: T.any,
        ControlsComponent: T.func,
        view: T.enum(...vals(Mode)),
        pageSetup: T.shape({
          name: 'pageSetup',
          margin: T.margin,
          size: T.size,
        }),
        printSetup: T.shape({
          name: 'printSetup',
          bleed: T.length,
          layout: T.enum(...vals(Layout)),
          marks: T.enum(...vals(Marks)),
          paper: T.enum(...vals(Paper)),
        }),
        rules: T.array,
      });

      this.pageSetup = new PageSetup(opts.pageSetup, opts.printSetup);

      const startLayout = opts.printSetup ? opts.printSetup.layout || PAGES : PAGES;
      const startMarks = opts.printSetup ? opts.printSetup.marks || CROP : CROP;
      this.viewer = new Viewer({
        pageSetup: this.pageSetup,
        mode: opts.view || PREVIEW,
        marks: startMarks,
        layout: startLayout,
        ControlsComponent: opts.ControlsComponent,
      });

      this.rules = attributeRules;
      if (opts.rules) this.addRules(opts.rules);

      this.getContentAsElement(opts.content).then((el) => {
        this.content = el;
        if (el && this.autorun) this.makeBook();
      });
    }

    // Convenience constructor
    static makeBook(opts = {}) {
      opts.autorun = opts.autorun ? opts.autorun : true;
      return new Bindery(opts);
    }

    async getContentAsElement(content) {
      if (content instanceof HTMLElement) return content;
      if (typeof content === 'string') {
        const el = document.querySelector(content);
        if (!(el instanceof HTMLElement)) {
          this.viewer.displayError('Content not specified', `Could not find element that matches selector "${content}"`);
          console.error(`Bindery: Could not find element that matches selector "${content}"`);
        }
        return el;
      }
      if (typeof content === 'object' && content.url) {
        return this.fetchContent(content.url, content.selector);
      }
      throw Error('Bindery: Source must be an element or selector');
    }

    async fetchContent(url, sel) {
      const response = await fetch(url);
      if (response.status !== 200) {
        this.viewer.displayError(response.status, `Could not find file at "${url}"`);
        throw Error(`Bindery: Could not find file at "${url}"`);
      }
      const fetchedContent = await response.text();
      const el = parseHTML(fetchedContent, sel);
      if (!(el instanceof HTMLElement)) {
        this.viewer.displayError(
          'Source not specified',
          `Could not find element that matches selector "${sel}"`
        );
        throw Error(`Bindery: Could not find element that matches selector "${sel}"`);
      }
      return el;
    }

    cancel() {
      this.viewer.hide();
      if (this.content) this.content.style.display = '';
    }

    addRules(newRules) {
      newRules.forEach((rule) => {
        if (rule instanceof rules.Rule) {
          this.rules.push(rule);
        } else {
          throw Error(`Bindery: The following is not an instance of Bindery.Rule and will be ignored: ${rule}`);
        }
      });
    }

    async makeBook() {
      if (!this.content) {
        this.viewer.show();
        console.error('No content');
        return null;
      }

      this.content.style.display = '';
      const content = this.content.cloneNode(true);
      this.content.style.display = 'none';

      this.layoutInProgress = true;
      this.viewer.clear(); // In case we're updating an existing layout
      this.viewer.show();
      this.pageSetup.updateStyleVars();
      this.viewer.inProgress = true;

      try {
        const onProgress = (current, progress) => this.viewer.updateProgress(current, progress);
        const book = await makeBook(content, this.rules, onProgress);
        this.viewer.progress = 1;
        this.layoutInProgress = false;
        await rAF$1();
        this.viewer.render(book);
        this.viewer.inProgress = false;
        return book;
      } catch (e) {
        this.layoutInProgress = false;
        this.viewer.inProgress = false;
        this.viewer.displayError('Layout couldn\'t complete', e.message);
        console.error(e);
        return null;
      }
    }
  }

  ___$insertStyle(".📖-page{width:var(--bindery-page-width);height:var(--bindery-page-height);position:relative;display:flex;flex-direction:column;flex-wrap:nowrap}li.continuation,p.continuation{text-indent:unset!important}li.continuation{list-style:none!important}.📖-flow-box{position:relative;margin-top:var(--bindery-margin-top);flex:1 1 auto;min-height:0}.📖-footer{margin-top:8pt;margin-bottom:var(--bindery-margin-bottom);flex:0 1 auto;z-index:1}.📖-flow-box,.📖-footer{margin-left:var(--bindery-margin-inner);margin-right:var(--bindery-margin-outer)}.📖-left .📖-flow-box,.📖-left .📖-footer{margin-left:var(--bindery-margin-outer);margin-right:var(--bindery-margin-inner)}.📖-page-background{position:absolute;z-index:0;overflow:hidden;top:calc(-1 * var(--bindery-bleed));bottom:calc(-1 * var(--bindery-bleed));left:calc(-1 * var(--bindery-bleed));right:calc(-1 * var(--bindery-bleed))}.📖-left>.📖-page-background{right:0}.📖-right>.📖-page-background{left:0}.📖-sup{font-size:.667em}.📖-footer,.📖-running-header{font-size:10pt}.📖-running-header{position:absolute;text-align:center;top:.25in}.📖-left .📖-running-header{text-align:left;left:var(--bindery-margin-outer)}.📖-right .📖-running-header{right:var(--bindery-margin-outer);text-align:right}.📖-page-size-rotated{height:var(--bindery-page-width);width:var(--bindery-page-height)}.📖-spread-size{height:var(--bindery-page-height);width:calc(var(--bindery-page-width) * 2)}.📖-spread-size-rotated{width:var(--bindery-page-height);height:calc(var(--bindery-page-width) * 2)}.📖-spread.📖-right>.📖-page-background{left:calc(-100% - var(--bindery-bleed))}.📖-spread.📖-left>.📖-page-background{right:calc(-100% - var(--bindery-bleed))}.📖-left .📖-rotate-container.📖-rotate-outward,.📖-left .📖-rotate-container.📖-rotate-spread-clockwise,.📖-right .📖-rotate-container.📖-rotate-inward,.📖-rotate-container.📖-rotate-clockwise{transform:rotate(90deg) translate3d(0,-100%,0);transform-origin:top left}.📖-left .📖-rotate-container.📖-rotate-inward,.📖-left .📖-rotate-container.📖-rotate-spread-counterclockwise,.📖-right .📖-rotate-container.📖-rotate-outward,.📖-rotate-container.📖-rotate-counterclockwise{transform:rotate(-90deg) translate3d(-100%,0,0);transform-origin:top left}.📖-rotate-container{position:absolute}.📖-left .📖-rotate-container.📖-rotate-clockwise .📖-page-background{bottom:0}.📖-left .📖-rotate-container.📖-rotate-counterclockwise .📖-page-background,.📖-right .📖-rotate-container.📖-rotate-clockwise .📖-page-background{top:0}.📖-right .📖-rotate-container.📖-rotate-counterclockwise .📖-page-background,.📖-rotate-container.📖-rotate-inward .📖-page-background{bottom:0}.📖-rotate-container.📖-rotate-outward .📖-page-background{top:0}.📖-right .📖-rotate-container.📖-rotate-spread-clockwise{transform:rotate(90deg) translate3d(0,-50%,0);transform-origin:top left}.📖-right .📖-rotate-container.📖-rotate-spread-counterclockwise{transform:rotate(-90deg) translate3d(-100%,-50%,0);transform-origin:top left}:root{--bindery-ui-bg:#f4f4f4;--bindery-ui-accent:#000;--bindery-ui-text:#000}@media screen{.📖-root{transition:opacity .2s;opacity:1;background:var(--bindery-ui-bg);z-index:2;position:relative;padding-top:40px;min-height:100vh}.📖-view-flip .📖-root{padding-top:0}.📖-progress-bar{transform-origin:top left;transform:scaleY(0);position:fixed;left:0;top:0;right:0;background:var(--bindery-ui-accent);transition:transform .2s;height:2px;z-index:2}.📖-in-progress .📖-progress-bar{transform:scaleX(0)}.📖-zoom-content{padding:10px;background:var(--bindery-ui-bg);position:absolute;left:0;right:0;margin:auto}.📖-view-preview .📖-zoom-content{min-width:calc(20px + var(--bindery-spread-width))}.📖-view-flip .📖-zoom-content{min-width:calc(1.1 * var(--bindery-spread-width))}.📖-view-print .📖-zoom-content{min-width:calc(20px + var(--bindery-sheet-width))}.📖-zoom-content>.📖-page{margin:auto}.📖-measure-area{position:fixed;padding:50px 20px;z-index:2;visibility:hidden;top:0;left:0;width:0;height:0;overflow:hidden}.📖-is-overflowing{border-bottom:1px solid #f0f}.📖-print-sheet{margin:0 auto}.📖-error{font:16px/1.4 -apple-system,BlinkMacSystemFont,Roboto,sans-serif;padding:15vh 15vw;z-index:3;position:fixed;top:0;left:0;right:0;bottom:0;background:hsla(0,0%,96%,.7)}.📖-error-title{font-size:1.5em;margin-bottom:16px}.📖-error-text{margin-bottom:16px;white-space:pre-line}.📖-error-footer{opacity:.5;font-size:.66em;text-transform:uppercase;letter-spacing:.02em}.📖-show-bleed .📖-print-sheet{background:#fff;outline:1px solid rgba(0,0,0,.1);box-shadow:0 1px 3px rgba(0,0,0,.2);margin:20px auto}}@media screen{.📖-page{background:#fff;outline:1px solid #ddd;overflow:hidden}.📖-show-bleed .📖-page{box-shadow:none;outline:none;overflow:visible}.📖-placeholder-pulse{animation:a 1s infinite}}@keyframes a{0%{opacity:.2}50%{opacity:.5}to{opacity:.2}}.📖-print-sheet{width:var(--bindery-sheet-width);height:var(--bindery-sheet-height)}.📖-show-bleed-marks .📖-print-sheet .📖-spread-wrapper,.📖-show-crop .📖-print-sheet .📖-spread-wrapper{margin:calc(var(--bindery-bleed) + 12pt) auto}body.viewing{margin:0}.📖-zoom-scaler{transform-origin:top left;transform-style:preserve-3d;height:calc(100vh - 120px)}.📖-print-sheet{overflow:hidden;align-items:center;transition:all .2s}.📖-print-sheet,.📖-spread-wrapper{position:relative;display:flex;justify-content:center}.📖-spread-wrapper{margin:0 auto 32px}.📖-print-sheet .📖-spread-wrapper{margin:0 auto}@page{margin:0}@media print{.📖-root *{-webkit-print-color-adjust:exact;color-adjust:exact}.📖-controls{display:none!important}.📖-print-sheet{padding:1px;margin:0 auto;page-break-after:always}.📖-zoom-scaler[style]{transform:none!important}}.📖-print-mark-wrap{display:none;position:absolute;pointer-events:none;top:0;bottom:0;left:0;right:0;z-index:3}.📖-show-bleed-marks .📖-print-mark-wrap,.📖-show-bleed-marks .📖-print-mark-wrap>[class*=bleed],.📖-show-crop .📖-print-mark-wrap,.📖-show-crop .📖-print-mark-wrap>[class*=crop]{display:block}.📖-print-mark-wrap>div{display:none;position:absolute;overflow:hidden}.📖-print-mark-wrap>div:after,.📖-print-mark-wrap>div:before{content:\"\";display:block;position:absolute}.📖-print-mark-wrap>div:before{top:0;left:0}.📖-print-mark-wrap>div:after{bottom:0;right:0}.📖-mark-bleed-left,.📖-mark-bleed-right,.📖-mark-crop-fold,.📖-mark-crop-left,.📖-mark-crop-right{width:1px;margin:auto}.📖-mark-bleed-left:after,.📖-mark-bleed-left:before,.📖-mark-bleed-right:after,.📖-mark-bleed-right:before,.📖-mark-crop-fold:after,.📖-mark-crop-fold:before,.📖-mark-crop-left:after,.📖-mark-crop-left:before,.📖-mark-crop-right:after,.📖-mark-crop-right:before{width:1px;height:var(--bindery-mark-length);background-image:linear-gradient(90deg,#000 0,#000 51%,transparent 0);background-size:1px 100%}.📖-mark-bleed-bottom,.📖-mark-bleed-top,.📖-mark-crop-bottom,.📖-mark-crop-top{height:1px}.📖-mark-bleed-bottom:after,.📖-mark-bleed-bottom:before,.📖-mark-bleed-top:after,.📖-mark-bleed-top:before,.📖-mark-crop-bottom:after,.📖-mark-crop-bottom:before,.📖-mark-crop-top:after,.📖-mark-crop-top:before{width:var(--bindery-mark-length);height:1px;background-image:linear-gradient(180deg,#000 0,#000 51%,transparent 0);background-size:100% 1px}.📖-mark-crop-fold{right:0;left:0}.📖-mark-crop-left{left:0}.📖-mark-crop-right{right:0}.📖-mark-crop-top{top:0}.📖-mark-crop-bottom{bottom:0}.📖-print-meta{padding:var(--bindery-mark-length);text-align:center;font-family:-apple-system,BlinkMacSystemFont,Roboto,sans-serif;font-size:8pt;display:block!important;position:absolute;bottom:-60pt;left:0;right:0}.📖-mark-bleed-left,.📖-mark-bleed-right,.📖-mark-crop-fold,.📖-mark-crop-left,.📖-mark-crop-right{top:calc(-1 * var(--bindery-mark-length) - var(--bindery-bleed));bottom:calc(-1 * var(--bindery-mark-length) - var(--bindery-bleed))}.📖-mark-bleed-bottom,.📖-mark-bleed-top,.📖-mark-crop-bottom,.📖-mark-crop-top{left:calc(-12pt - var(--bindery-bleed));right:calc(-12pt - var(--bindery-bleed))}.📖-mark-bleed-left{left:calc(-1 * var(--bindery-bleed))}.📖-mark-bleed-right{right:calc(-1 * var(--bindery-bleed))}.📖-mark-bleed-top{top:calc(-1 * var(--bindery-bleed))}.📖-mark-bleed-bottom{bottom:calc(-1 * var(--bindery-bleed))}.📖-view-flip .📖-zoom-scaler{transform-origin:center left}.📖-flap-holder{perspective:5000px;position:absolute;top:0;right:0;left:0;bottom:0;margin:auto;transform-style:preserve-3d}.📖-flip-sizer{position:relative;margin:auto;padding:0 20px;box-sizing:content-box;height:90vh!important}.📖-page3d{margin:auto;width:var(--bindery-page-width);height:var(--bindery-page-height);transform:rotateY(0);transform-style:preserve-3d;transform-origin:left;transition:transform .5s,box-shadow .1s;position:absolute;left:0;right:0;top:0;bottom:0}.📖-page3d:hover{box-shadow:2px 0 4px rgba(0,0,0,.2)}.📖-page3d.📖-flipped{transform:rotateY(-180deg)}.📖-page3d .📖-page{position:absolute;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:none}.📖-page3d .📖-page3d-front{transform:rotateY(0)}.📖-page3d .📖-page3d-back{transform:rotateY(-180deg)}");

  /* global BINDERY_VERSION */


  const BinderyWithRules = Object.assign(Bindery, rules);
  BinderyWithRules.View = Mode;
  BinderyWithRules.Paper = Paper;
  BinderyWithRules.Layout = Layout;
  BinderyWithRules.Marks = Marks;
  BinderyWithRules.version = BINDERY_VERSION;

  return BinderyWithRules;

})));
//# sourceMappingURL=bindery.umd.js.map
