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

const MAXIMUM_PAGE_LIMIT = 2000;

class Book {
  constructor() {
    this.pages = [];
    this.queued = [];
    this.isComplete = false;
    this.estimatedProgress = 0;
  }
  get pageCount() {
    return this.pages.length;
  }

  // arguments: selector : String
  // return: pages : [ Int ]
  // if no matches: []
  pagesForSelector(sel) {
    return this.pagesForTest(page => page.element.querySelector(sel));
  }
  // arguments: testFunc : (element) => bool
  // return: pages : [ Int ]
  // if no matches: []
  pagesForTest(testFunc) {
    return this.pages.filter(pg => testFunc(pg.element)).map(pg => pg.number);
  }

  onComplete(func) {
    if (!this.isComplete) this.queued.push(func);
    else func();
  }

  setCompleted() {
    this.isComplete = true;
    this.estimatedProgress = 1;
    this.queued.forEach((func) => {
      func();
    });
    this.queued = [];
  }

  validate() {
    if (this.pageCount > MAXIMUM_PAGE_LIMIT) {
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }
  }
}

const last = arr => arr[arr.length - 1];

const makeRanges = (arr) => {
  let str = '';
  let prevNum = arr[0];
  let isInARange = false;
  arr.forEach((num, i) => {
    const isLast = i === arr.length - 1;
    const isAdjacent = num === prevNum + 1;

    if (i === 0) {
      str += `${num}`;
    } else if (isLast) {
      if (isAdjacent) {
        str += `–${num}`;
      } else if (isInARange) {
        str += `–${prevNum}, ${num}`;
      } else {
        str += `, ${num}`;
      }
    } else if (isAdjacent) {
      isInARange = true;
    } else if (isInARange && !isAdjacent) {
      isInARange = false;
      str += `–${prevNum}, ${num}`;
    } else {
      str += `, ${num}`;
    }
    prevNum = num;
  });
  // return `${str} - [${arr}]`;
  return str;
};

const cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;

const isValidLength = str => cssNumberRegEx.test(str);

const parseVal = (str) => {
  const matches = str.match(cssNumberRegEx);
  return {
    val: Number(matches[1]),
    unit: matches[3],
  };
};

const validate = (opts, validOpts) => {
  let isValid = true;
  Object.keys(opts).forEach((k) => {
    if (!validOpts[k]) {
      console.error(`Bindery: '${validOpts.name}' doesn't have property '${k}'`);
      isValid = false;
    } else {
      const val = opts[k];
      const checker = validOpts[k];
      if (!checker(val)) {
        console.error(`Bindery: For property '${validOpts.name}.${k}', ${JSON.stringify(val)} is not a valid value of type ${checker.name}`);
        isValid = false;
      }
    }
  });
  return isValid;
};

const isObj = val => typeof val === 'object';
const isFunc = val => typeof val === 'function';
const isBool = val => typeof val === 'boolean';
const isStr = val => typeof val === 'string';
const isArr = val => Array.isArray(val);

const isShape = validShape => userShape => isObj(userShape) && validate(userShape, validShape);
const isMargin = val => isShape({
  name: 'margin',
  top: isValidLength,
  inner: isValidLength,
  outer: isValidLength,
  bottom: isValidLength,
})(val);
const isSize = val => isShape({
  name: 'size',
  width: isValidLength,
  height: isValidLength,
})(val);

const OptionType = {
  enum(...enumCases) {
    const enumCheck = function enumCheck(str) { return enumCases.includes(str); };
    Object.defineProperty(enumCheck, 'name', { writable: true });
    enumCheck.name = `enum ( '${enumCases.join('\' | \'')}' )`;
    return enumCheck;
  },
  any: () => true,
  string: isStr,
  length: isValidLength,
  bool: isBool,
  func: isFunc,
  obj: isObj,
  array: isArr,
  shape: isShape,
  margin: isMargin,
  size: isSize,
  validate,
};

//
// prefix classes
const p = '📖-';

const prefix = str => `${p}${str}`;
const prefixClass = str => `.${prefix(str)}`;

const prefixer$1 = (str) => {
  if (str[0] === '.') {
    return prefixClass(str.substr(1));
  }
  return prefix(str);
};

// Create div with prefixed classes
const createEl = (className, content = []) => {
  const div = document.createElement('div');
  div.className = className.split('.').filter(txt => txt !== '').map(prefixer$1).join(' ');

  if (typeof content === 'string') {
    div.textContent = content;
  } else if (Array.isArray(content)) {
    content.forEach(child => div.appendChild(child));
  }
  return div;
};

// Create stylesheet with id
const addStylesheet = (id) => {
  const style = document.createElement('style');
  style.id = id;
  document.head.appendChild(style);
  return style;
};

// Fetch or create stylesheet with id
const stylesheet = id => document.querySelector(`#${id}`) || addStylesheet(id);

const c = prefixer$1;

const elementToString = (node) => {
  const tag = node.tagName.toLowerCase();
  const id = node.id ? `#${node.id}` : '';

  let classes = '';
  if (node.classList.length > 0) {
    classes = `.${[...node.classList].join('.')}`;
  }

  let text = '';
  if (id.length < 1 && classes.length < 2) {
    text = `("${node.textContent.substr(0, 30).replace(/\s+/g, ' ')}...")`;
  }
  return tag + id + classes + text;
};

class Page {
  constructor() {
    this.flowContent = createEl('flow-content');
    this.flowBox = createEl('flow-box', [this.flowContent]);
    this.footer = createEl('footer');
    this.background = createEl('page-background');
    this.element = createEl('page', [this.background, this.flowBox, this.footer]);
    this.path = null;
  }

  get currentElement() {
    if (this.path.length > 0) return last(this.path);
    return this.flowContent;
  }

  overflowAmount() {
    const contentH = this.flowContent.offsetHeight;
    const boxH = this.flowBox.offsetHeight;

    if (boxH === 0) {
      throw Error('Bindery: Trying to flow into a box of zero height.');
    }

    return contentH - boxH;
  }
  hasOverflowed() {
    return this.overflowAmount() > -5;
  }

  validate() {
    if (this.hasOverflowed()) {
      const suspect = this.currentElement;
      if (suspect) {
        console.warn(`Bindery: Content overflows, probably due to a style set on ${elementToString(suspect)}.`);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.warn('Bindery: Content overflows.');
      }
    }
  }

  validateEnd(allowOverflow) {
    if (this.hasOverflowed()) {
      console.warn(`Bindery: Page ~${this.number} is overflowing`, this.element);
      if (!this.suppressErrors && !allowOverflow) {
        throw Error('Bindery: Moved to new page when last one is still overflowing');
      }
    }
  }

  static isSizeValid() {
    document.body.classList.remove(c('viewing'));

    const testPage = new Page();
    let measureArea = document.querySelector(c('.measure-area'));
    if (!measureArea) measureArea = document.body.appendChild(createEl('measure-area'));

    measureArea.innerHTML = '';
    measureArea.appendChild(testPage.element);
    const box = testPage.flowBox.getBoundingClientRect();

    measureArea.parentNode.removeChild(measureArea);

    return (box.height > 100) && (box.width > 100); // TODO: Number is arbitrary
  }

  setLeftRight(dir) {
    if (dir === 'left') {
      this.side = dir;
      this.element.classList.remove(c('right'));
      this.element.classList.add(c('left'));
    } else if (dir === 'right') {
      this.side = dir;
      this.element.classList.remove(c('left'));
      this.element.classList.add(c('right'));
    } else {
      throw Error(`Bindery: Setting page to invalid direction${dir}`);
    }
  }

  get suppressErrors() {
    return this.suppress || false;
  }

  set suppressErrors(newVal) {
    this.suppress = newVal;
    if (newVal) {
      this.element.classList.add(c('is-overflowing'));
    } else {
      this.element.classList.remove(c('is-overflowing'));
    }
  }

  get isEmpty() {
    return (
      !this.hasOutOfFlowContent
      && this.flowContent.textContent.trim() === ''
      && this.flowContent.offsetHeight < 1
    );
  }

  get isLeft() {
    return this.side === 'left';
  }

  get isRight() {
    return this.side === 'right';
  }

  setPreference(dir) {
    if (dir === 'left') this.alwaysLeft = true;
    if (dir === 'right') this.alwaysRight = true;
  }
}

const overflowAttr = 'data-ignore-overflow';
const didMoveAttr = 'data-bindery-did-move';

// Walk up the tree to see if we are within
// an overflow-ignoring node
const ignoreOverflow = (element) => {
  if (element.hasAttribute(overflowAttr)) return true;
  if (element.parentElement) return ignoreOverflow(element.parentElement);
  return false;
};

// Walk up the tree to see if we can safely
// insert a split into this node.
const isSplittable = (element, selectors) => {
  if (selectors.some(sel => element.matches(sel))) {
    if (element.hasAttribute(didMoveAttr)
      || element.classList.contains(c('continuation'))) {
      return true; // ignore rules and split it anyways.
    }
    return false;
  }
  if (element.parentElement) return isSplittable(element.parentElement, selectors);
  return true;
};

// Shifts this element to the next page. If any of its
// ancestors cannot be split across page, it will
// step up the tree to find the first ancestor
// that can be split, and move all of that descendants
// to the next page.
const shiftToNextPage = (page, continueOnNewPage, canSplitElement) => {
  // So this node won't get cloned. TODO: this is unclear
  const elementToMove = page.path.pop();

  if (page.path.length < 1) {
    throw Error('Bindery: Attempting to move the top-level element');
  }

  // find the nearest splittable parent
  let nearestElementThatCanBeMoved = elementToMove;
  const pathToRestore = [];
  while (page.path.length > 1 && !canSplitElement(page.currentElement)) {
    nearestElementThatCanBeMoved = page.path.pop();
    pathToRestore.unshift(nearestElementThatCanBeMoved);
  }

  // Once a node is moved to a new page, it should no longer trigger another
  // move. otherwise tall elements will endlessly get shifted to the next page
  nearestElementThatCanBeMoved.setAttribute('data-bindery-did-move', true);

  const parent = nearestElementThatCanBeMoved.parentNode;
  parent.removeChild(nearestElementThatCanBeMoved);

  // If the nearest ancestor would be empty without this node,
  // move it to the next page too.
  if (page.path.length > 1 && page.currentElement.textContent.trim() === '') {
    parent.appendChild(nearestElementThatCanBeMoved);
    nearestElementThatCanBeMoved = page.path.pop();
    pathToRestore.unshift(nearestElementThatCanBeMoved);
    nearestElementThatCanBeMoved.parentNode.removeChild(nearestElementThatCanBeMoved);
  }

  let newPage;
  if (!page.isEmpty) {
    if (page.hasOverflowed()) page.suppressErrors = true;
    newPage = continueOnNewPage();
  } else {
    // If the page is empty when this node is removed,
    // then it won't help to move it to the next page.
    // Instead continue here until the node is done.
    newPage = page;
  }

  // append moved node as first in new page
  newPage.currentElement.appendChild(nearestElementThatCanBeMoved);

  // restore subpath
  pathToRestore.forEach(r => newPage.path.push(r));
  newPage.path.push(elementToMove);
};

// When there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent stack overflow
// and browser lockup

const MAX_TIME = 50; // ms

const rAF = () => new Promise((resolve) => {
  requestAnimationFrame(t => resolve(t));
});

class Scheduler {
  constructor() {
    this.lastYieldTime = 0;
  }

  shouldYield() {
    const timeSinceYield = performance.now() - this.lastYieldTime;
    return timeSinceYield > MAX_TIME;
  }

  async yieldIfNecessary() {
    if (this.shouldYield()) this.lastYieldTime = await rAF();
  }
}

var scheduler = new Scheduler();

const isTextNode = node => node.nodeType === Node.TEXT_NODE;
const isElement = node => node.nodeType === Node.ELEMENT_NODE;
const isScript = node => node.tagName === 'SCRIPT';
const isImage = node => node.tagName === 'IMG';
const isUnloadedImage = node => isImage(node) && !node.naturalWidth;
const isContent = node => isElement(node) && !isScript(node);

const createTextNode = (document.createTextNode).bind(document);

// Try adding a text node in one go.
// Returns true if all the text fits, false if none fits.
const addTextNode = async (textNode, parent, hasOverflowed) => {
  parent.appendChild(textNode);
  const success = !hasOverflowed();
  if (!success) parent.removeChild(textNode);
  await scheduler.yieldIfNecessary();
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
      await scheduler.yieldIfNecessary();
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

  // Create a new text node for the next page
  const remainingTextNode = createTextNode(overflowingText);
  return remainingTextNode;
};


// Fills text across multiple elements by requesting a continuation
// once the current element overflows
const addTextNodeAcrossElements = async (textNode, parent, continuation, hasOverflowed) => {
  const result = await addTextNodeUntilOverflow(textNode, parent, hasOverflowed);
  if (isTextNode(result)) {
    const nextElement = continuation();
    return addTextNodeAcrossElements(result, nextElement, continuation, hasOverflowed);
  }
  return result;
};

class Rule {
  constructor(options) {
    this.name = options.name ? options.name : 'Unnamed Bindery Rule';
    this.selector = '';

    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
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

class FullBleedPage extends OutOfFlow {
  constructor(options) {
    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';
    super(options);
    OptionType.validate(options, {
      name: 'FullBleedPage',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'same', 'left', 'right'),
      rotate: OptionType.enum('none', 'inward', 'outward', 'clockwise', 'counterclockwise'),
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

class FullBleedSpread extends OutOfFlow {
  constructor(options) {
    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';
    super(options);
    OptionType.validate(options, {
      name: 'FullBleedSpread',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'same', 'left', 'right'),
      rotate: OptionType.enum('none', 'clockwise', 'counterclockwise'),
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

class PageBreak extends Rule {
  constructor(options) {
    options.position = options.position || 'before';
    options.continue = options.continue || 'next';
    super(options);

    OptionType.validate(options, {
      name: 'PageBreak',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'left', 'right'),
      position: OptionType.enum('before', 'after', 'both', 'avoid'),
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

const isFullPageRule = rule => (
    rule instanceof FullBleedSpread
    || rule instanceof FullBleedPage
    || rule instanceof PageBreak
);

const dedupe = (inputRules) => {
  const conflictRules = inputRules.filter(isFullPageRule);
  const uniqueRules = inputRules.filter(rule => !conflictRules.includes(rule));

  const firstSpreadRule = conflictRules.find(rule => rule instanceof FullBleedSpread);
  const firstPageRule = conflictRules.find(rule => rule instanceof FullBleedPage);

  // Only apply one fullpage or fullspread
  if (firstSpreadRule) uniqueRules.push(firstSpreadRule);
  else if (firstPageRule) uniqueRules.push(firstPageRule);
  else uniqueRules.push(...conflictRules); // multiple pagebreaks are ok

  return uniqueRules;
};


class RuleSet {
  constructor(rules) {
    this.rules = rules;
    // separate by lifecycle
    this.pageRules = rules.filter(r => r.eachPage);
    this.beforeAddRules = rules.filter(r => r.selector && r.beforeAdd);
    this.afterAddRules = rules.filter(r => r.selector && r.afterAdd);
    this.selectorsNotToSplit = rules.filter(r => r.avoidSplit).map(r => r.selector);
    // setup
    this.rules.filter(r => r.setup).forEach(r => r.setup());
  }
  applyPageStartRules(pg, book) {
    this.rules.forEach((rule) => {
      if (rule.afterPageCreated) rule.afterPageCreated(pg, book);
    });
  }
  finishEveryPage(book) {
    this.pageRules.forEach((rule) => {
      book.pages.forEach((page) => {
        rule.eachPage(page, book);
      });
    });
  }
  applyPageDoneRules(page, book) {
    this.pageRules.forEach((rule) => {
      rule.eachPage(page, book);
    });
  }
  applyBeforeAddRules(element, book, continueOnNewPage, makeNewPage) {
    let addedElement = element;

    const matchingRules = this.beforeAddRules.filter(rule => addedElement.matches(rule.selector));
    // const uniqueRules = dedupeRules(matchingRules);

    matchingRules.forEach((rule) => {
      addedElement = rule.beforeAdd(addedElement, book, continueOnNewPage, makeNewPage);
    });
    return addedElement;
  }

  applyAfterAddRules(originalElement, book, continueOnNewPage, makeNewPage) {
    let addedElement = originalElement;

    const matchingRules = this.afterAddRules.filter(rule => addedElement.matches(rule.selector));
    const uniqueRules = dedupe(matchingRules);

    // TODO:
    // While this does catch overflows, it introduces a few new bugs.
    // It is pretty aggressive to move the entire node to the next page.
    // - 1. there is no guarentee it will fit on the new page
    // - 2. if it has childNodes, those side effects will not be undone,
    // which means footnotes will get left on previous page.
    // - 3. if it is a large paragraph, it will leave a large gap. the
    // ideal approach would be to only need to invalidate
    // the last line of text.

    uniqueRules.forEach((rule) => {
      addedElement = rule.afterAdd(
        addedElement,
        book,
        continueOnNewPage,
        makeNewPage,
        (problemElement) => {
          problemElement.parentNode.removeChild(problemElement);
          const newPage = continueOnNewPage();
          newPage.currentElement.appendChild(problemElement);
          return rule.afterAdd(
            problemElement,
            book,
            continueOnNewPage,
            makeNewPage,
            () => {
              console.log(`Couldn't apply ${rule.name} to ${elementToString(problemElement)}. Caused overflows twice.`);
            }
          );
        }
      );
    });
    return addedElement;
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
  // ———
  // NUMBERING

  // TODO: Pass in facingpages options
  const facingPages = true;
  if (facingPages) {
    pages.forEach((page, i) => {
      page.number = i + 1;
      page.setLeftRight((i % 2 === 0) ? 'right' : 'left');
    });
  } else {
    pages.forEach((page) => { page.setLeftRight('right'); });
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

// @param rules: array of Bindery.Rules
// @return: A new function that clones the given
// path according to those rules. (original : Array) => clone : Array
//
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

const clonePath = (oldPath, rules) => {
  const newPath = [];

  // TODO check if element actually matches
  const toNextClasses = rules
    .filter(rule => rule.customToNextClass)
    .map(rule => rule.customToNextClass);
  const fromPrevClasses = rules
    .filter(rule => rule.customFromPreviousClass)
    .map(rule => rule.customFromPreviousClass);

  const markAsToNext = (node) => {
    node.classList.add(c('continues'));
    toNextClasses.forEach(cl => node.classList.add(cl));
  };

  const markAsFromPrev = (node) => {
    node.classList.add(c('continuation'));
    fromPrevClasses.forEach(cl => node.classList.add(cl));
  };

  for (let i = oldPath.length - 1; i >= 0; i -= 1) {
    const original = oldPath[i];
    const clone = original.cloneNode(false); // shallow
    clone.innerHTML = '';

    markAsToNext(original);
    markAsFromPrev(clone);

    // Special case for ordered lists
    if (clone.tagName === 'OL') {
      // restart numbering
      let prevStart = 1;
      if (original.hasAttribute('start')) {
        // the OL is also a continuation
        prevStart = parseInt(original.getAttribute('start'), 10);
      }
      if (i < oldPath.length - 1 && oldPath[i + 1].tagName === 'LI') {
        // the first list item is a continuation
        prevStart -= 1;
      }
      const prevCount = original.children.length;
      const newStart = prevStart + prevCount;
      clone.setAttribute('start', newStart);
    }

    if (i < oldPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }

  return newPath;
};

// Note: Doesn't ever reject, since missing images
// shouldn't prevent layout from resolving

const wait10 = () => new Promise((resolve) => {
  setTimeout(() => { resolve(); }, 10);
});

const ensureImageLoaded = async (image) => {
  const imgStart = performance.now();
  let failed = false;
  image.addEventListener('error', () => { failed = true; });
  image.src = image.src;

  while (!image.naturalWidth && !failed) {
    await wait10();
  }

  return performance.now() - imgStart;
};

const sec = ms => (ms / 1000).toFixed(2);
class Estimator {
  constructor() {
    this.startLayoutTime = 0;
    this.timeWaitingForImage = 0;
    this.capacity = 0;
    this.elementsProcessed = 0;
  }
  startWith(content) {
    this.capacity = content.querySelectorAll('*').length;
    this.startLayoutTime = window.performance.now();
  }
  increment() {
    this.elementsProcessed += 1;
  }
  async ensureImageLoaded(img) {
    const waitTime = await ensureImageLoaded(img);
    this.timeWaitingForImage += waitTime;
  }
  end() {
    const endLayoutTime = window.performance.now();
    const totalTime = endLayoutTime - this.startLayoutTime;
    const layoutTime = totalTime - this.timeWaitingForImage;

    console.log(`📖 Book ready in ${sec(totalTime)}s (Layout: ${sec(layoutTime)}s, waiting for images: ${sec(this.timeWaitingForImage)}s)`);
  }
  get progress() {
    return this.elementsProcessed / this.capacity;
  }
}

// Bindery
// paginate
// Utils
const paginate$1 = (content, rules, progressCallback) => {
  // Global state for a pagination run
  const estimator = new Estimator();
  const ruleSet = new RuleSet(rules);
  const book = new Book();
  const noSplit = ruleSet.selectorsNotToSplit;

  const hasOverflowed = () => book.currentPage.hasOverflowed();
  const ignoreCurrentOverflow = () => ignoreOverflow(book.currentPage.currentElement);
  const canSplitElement = el => isSplittable(el, noSplit) && !ignoreOverflow(el);
  const canSplitElementAlt = el => isSplittable(el, noSplit);

  const makeNewPage = () => {
    const newPage = new Page();
    ruleSet.applyPageStartRules(newPage, book);
    return newPage;
  };

  const finishPage = (page, allowOverflow) => {
    // finished with this page, can display
    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);
    ruleSet.applyPageDoneRules(page, book);
    page.validateEnd(allowOverflow);
    book.validate();
  };

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  const continueOnNewPage = (allowOverflow = false) => {
    const oldPage = book.currentPage;
    if (oldPage) finishPage(oldPage, allowOverflow);

    const newPage = makeNewPage();
    newPage.path = oldPage ? clonePath(oldPage.path, rules) : [];

    book.currentPage = newPage;
    book.pages.push(newPage);

    if (newPage.path[0]) {
      newPage.flowContent.appendChild(newPage.path[0]);
    }

    progressCallback(book); // assuming this will display new page
    newPage.validate(); // TODO: element must be in dom before validating
    return newPage;
  };

  const addTextWithoutChecks = (textNode, parent) => {
    parent.appendChild(textNode);
    if (!ignoreCurrentOverflow()) {
      book.currentPage.suppressErrors = true;
      continueOnNewPage();
    }
  };

  const addWholeTextNode = async (textNode) => {
    let hasAdded = await addTextNode(textNode, book.currentPage.currentElement, hasOverflowed);
    if (!hasAdded && !ignoreCurrentOverflow()) {
      // try on next page
      shiftToNextPage(book.currentPage, continueOnNewPage, canSplitElementAlt);
      hasAdded = await addTextNode(textNode, book.currentPage.currentElement, hasOverflowed);
    }
    if (!hasAdded) {
      addTextWithoutChecks(textNode, book.currentPage.currentElement);
    }
  };

  const continuedElement = () => {
    const newPage = continueOnNewPage();
    return newPage.currentElement;
  };

  const addSplittableTextNode = async (textNode) => {
    const el = book.currentPage.currentElement;
    let hasAdded = await addTextNodeAcrossElements(textNode, el, continuedElement, hasOverflowed);
    if (!hasAdded && book.currentPage.path.length > 1) {
      // try on next page
      shiftToNextPage(book.currentPage, continueOnNewPage, canSplitElementAlt);
      hasAdded = await addTextNodeAcrossElements(textNode, el, continuedElement, hasOverflowed);
    }
    if (!hasAdded) {
      addTextWithoutChecks(textNode, book.currentPage.currentElement);
    }
  };


  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = async (elementToAdd) => {
    if (hasOverflowed() && !ignoreCurrentOverflow()) {
      book.currentPage.suppressErrors = true;
      continueOnNewPage();
    }

    // Ensure images are loaded before measuring
    if (isUnloadedImage(elementToAdd)) await estimator.ensureImageLoaded(elementToAdd);

    // Transforms before adding
    const element = ruleSet.applyBeforeAddRules(elementToAdd, book, continueOnNewPage, makeNewPage);

    // Insert element
    book.currentPage.currentElement.appendChild(element);
    book.currentPage.path.push(element);

    // Clear element
    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    // Overflows when empty
    if (hasOverflowed() && !ignoreCurrentOverflow()) {
      shiftToNextPage(book.currentPage, continueOnNewPage, canSplitElementAlt);
    }

    const shouldSplit = canSplitElement(element);

    for (const child of childNodes) {
      if (isTextNode(child)) {
        await (shouldSplit ? addSplittableTextNode : addWholeTextNode)(child);
      } else if (isContent(child)) {
        await addElementNode(child);
      } else {
        // Skip comments and unknown nodes
      }
    }

    // Transforms after adding
    const addedElement = book.currentPage.path.pop();
    ruleSet.applyAfterAddRules(addedElement, book, continueOnNewPage, makeNewPage);
    estimator.increment();
    book.estimatedProgress = estimator.progress;
  };

  const init = async () => {
    estimator.startWith(content);
    content.style.margin = 0;
    content.style.padding = 0;
    continueOnNewPage();

    await addElementNode(content);

    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);

    book.setCompleted();
    ruleSet.finishEveryPage(book);
    estimator.end();

    return book;
  };

  return init();
};

const Mode = Object.freeze({
  FLIPBOOK: 'view_flipbook',
  PREVIEW: 'view_preview',
  PRINT: 'view_print',
});

const Paper = Object.freeze({
  AUTO: 'paper_auto',
  AUTO_BLEED: 'paper_auto_bleed',
  AUTO_MARKS: 'paper_auto_marks',
  LETTER_PORTRAIT: 'paper_letter_p',
  LETTER_LANDSCAPE: 'paper_letter_l',
  A4_PORTRAIT: 'paper_a4_p',
  A4_LANDSCAPE: 'paper_a4_l',
});

const Layout = Object.freeze({
  PAGES: 'layout_pages',
  SPREADS: 'layout_spreads',
  BOOKLET: 'layout_booklet',
});

const Marks = Object.freeze({
  NONE: 'marks_none',
  CROP: 'marks_crop',
  BLEED: 'marks_bleed',
  BOTH: 'marks_both',
});

const letter = { width: '8.5in', height: '11in' };
const a4 = { width: '210mm', height: '297mm' };
const defaultOpts = {
  bleed: '12pt',
  size: { width: '4in', height: '6in' },
  margin: {
    inner: '24pt',
    outer: '24pt',
    bottom: '40pt',
    top: '48pt',
  },
};

const supportsCustomPageSize = !!window.chrome && !!window.chrome.webstore;

class PageSetup {

  constructor(opts = {}) {
    this.size = opts.size || defaultOpts.size;
    this.margin = opts.margin || defaultOpts.margin;
    this.bleed = opts.bleed || defaultOpts.bleed;
    this.markLength = '12pt';
  }

  setupPaper(opts = {}) {
    this.sheetSizeMode = supportsCustomPageSize ? (opts.paper || Paper.AUTO) : Paper.AUTO_MARKS;
    this.printTwoUp = opts.layout && opts.layout !== Layout.PAGES;
  }

  setPrintTwoUp(newVal) {
    this.printTwoUp = newVal;
  }

  get displaySize() {
    const width = this.printTwoUp
      ? this.spreadSize.width
      : this.size.width;
    const height = this.size.height;
    const bleed = this.bleed;

    return { width, height, bleed };
  }

  get sheetSize() {
    const width = this.printTwoUp ? this.spreadSize.width : this.size.width;
    const height = this.size.height;

    const bleedAmount = `2 * ${this.bleed}`;
    const marksAmount = `2 * ${this.bleed} + 2 * ${this.markLength}`;
    switch (this.sheetSizeMode) {
    case Paper.AUTO:
      return { width, height };
    case Paper.AUTO_BLEED:
      return {
        width: `calc(${width} + ${bleedAmount})`,
        height: `calc(${height} + ${bleedAmount})`,
      };
    case Paper.AUTO_MARKS:
      return {
        width: `calc(${width} + ${marksAmount})`,
        height: `calc(${height} + ${marksAmount})`,
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
    return { width, height };
  }

  isSizeValid() {
    this.updateStyleVars();
    return Page.isSizeValid();
  }

  get spreadSize() {
    const w = parseVal(this.size.width);
    return {
      height: this.size.height,
      width: `${w.val * 2}${w.unit}`,
    };
  }

  updateStyleVars() {
    const page = this.size;
    const sheet = this.sheetSize;
    const vars = Object.entries({
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
    }).map(([k, v]) => `--bindery-${k}: ${v};`);

    const rootRule = `:root { ${vars.join('')}  }`;
    const pageRule = `@page { size: ${sheet.width} ${sheet.height}; }`;

    stylesheet('binderyPage').innerHTML = `${rootRule} ${pageRule}`;
  }
}

/* global BINDERY_VERSION */

var errorView = function (title, text) {
  return createEl('.error', [
    createEl('.error-title', title),
    createEl('.error-text', text),
    createEl('.error-footer', `Bindery ${BINDERY_VERSION}`),
  ]);
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

const renderGridLayout = (pages, isTwoUp) => {
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

const twoPageSpread$1 = children => createEl('.spread-wrapper.spread-size', children);
const onePageSpread$1 = children => createEl('.spread-wrapper.page-size', children);

const renderPrintLayout = (pages, isTwoUp, isBooklet) => {
  const printLayout = document.createDocumentFragment();

  const marks = isTwoUp ? printMarksSpread : printMarksSingle;
  const spread = isTwoUp ? twoPageSpread$1 : onePageSpread$1;

  const printSheet = children => createEl('.print-page', [spread(children)]);

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
        spreadMarks]
      );
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

const renderFlipLayout = (pages, doubleSided) => {
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
      leftPage.classList.add(c('page3d-back'));
      flap.appendChild(leftPage);
    } else {
      leftPage = createEl('.page.page3d-back');
      flap.appendChild(leftPage);
    }
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

const modeClasses = {};
modeClasses[Mode.PREVIEW] = c('view-preview');
modeClasses[Mode.PRINT] = c('view-print');
modeClasses[Mode.FLIPBOOK] = c('view-flip');

const isCommandP = e => (e.ctrlKey || e.metaKey) && e.keyCode === 80;

class Viewer {
  constructor({ pageSetup, mode, layout, marks, ControlsComponent }) {
    this.book = null;
    this.pageSetup = pageSetup;

    this.progressBar = createEl('.progress-bar');
    this.content = createEl('zoom-content');
    this.scaler = createEl('zoom-scaler', [this.content]);
    this.element = createEl('root', [this.progressBar, this.scaler]);

    this.doubleSided = true;
    this.printArrange = layout;

    this.setMarks(marks);
    this.mode = mode;
    this.element.classList.add(c('view-preview'));
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    this.setPrint = this.setPrint.bind(this);

    if (ControlsComponent) {
      this.controls = new ControlsComponent(
        { Mode, Paper, Layout, Marks }, // Available options
        { // Initial props
          paper: this.pageSetup.sheetSizeMode,
          layout: this.printArrange,
          mode: this.mode,
          marks,
        },
        { // Actions
          setMode: (newMode) => {
            if (newMode === this.mode) return;
            this.mode = newMode;
            this.render();
          },
          setPaper: this.setSheetSize.bind(this),
          setLayout: this.setPrintArrange.bind(this),
          setMarks: this.setMarks.bind(this),
          getPageSize: () => this.pageSetup.displaySize,
        }
      );
      this.element.appendChild(this.controls.element);
    }

    this.element.classList.add(c('in-progress'));

    document.body.appendChild(this.element);
  }

  // Automatically switch into print mode
  listenForPrint() {
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener((mql) => {
        if (mql.matches) {
          // before print
          this.setPrint();
        } else {
          // after print
        }
      });
    }
    document.body.addEventListener('keydown', (e) => {
      if (isCommandP(e)) {
        e.preventDefault();
        this.setPrint();
        setTimeout(() => window.print(), 200);
      }
    });
  }

  listenForResize() {
    window.addEventListener('resize', () => {
      if (!this.throttleResize) {
        this.updateZoom();
        this.throttleResize = setTimeout(() => {
          this.throttleResize = null;
        }, 20);
      }
    });
  }

  setInProgress() {
    this.element.classList.add(c('in-progress'));
    if (this.controls) this.controls.setInProgress();
  }

  get isTwoUp() {
    return this.printArrange !== Layout.PAGES;
  }

  get isShowingCropMarks() {
    return this.element.classList.contains(c('show-crop'));
  }

  set isShowingCropMarks(newVal) {
    if (newVal) {
      this.element.classList.add(c('show-crop'));
      this.setPrint();
    } else {
      this.element.classList.remove(c('show-crop'));
    }
  }
  get isShowingBleedMarks() {
    return this.element.classList.contains(c('show-bleed-marks'));
  }
  set isShowingBleedMarks(newVal) {
    if (newVal) {
      this.element.classList.add(c('show-bleed-marks'));
      this.setPrint();
    } else {
      this.element.classList.remove(c('show-bleed-marks'));
    }
  }

  setSheetSize(newVal) {
    this.pageSetup.sheetSizeMode = newVal;
    this.pageSetup.updateStyleVars();

    if (this.mode !== Mode.PRINT) {
      this.setPrint();
    }
    this.updateZoom();
    setTimeout(() => { this.updateZoom(); }, 300);
  }

  setPrintArrange(newVal) {
    if (newVal === this.printArrange) return;
    this.printArrange = newVal;

    this.pageSetup.setPrintTwoUp(this.isTwoUp);
    this.pageSetup.updateStyleVars();

    if (this.mode === Mode.PRINT) {
      this.render();
    } else {
      this.setPrint();
    }
  }

  setMarks(newVal) {
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

  displayError(title, text) {
    if (!this.element.parentNode) {
      document.body.appendChild(this.element);
    }
    if (!this.error) {
      this.error = errorView(title, text);
      this.element.appendChild(this.error);
    }
  }
  clear() {
    this.book = null;
    this.lastSpreadInProgress = null; // TODO: Make this clearer, after first render
    this.content.innerHTML = '';
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
  toggleBleed() {
    this.element.classList.add(c('show-bleed'));
  }
  toggleDouble() {
    this.doubleSided = !this.doubleSided;
    this.render();
  }
  setPrint() {
    if (this.mode === Mode.PRINT) return;
    this.mode = Mode.PRINT;
    this.render();
  }
  render(newBook) {
    if (newBook) this.book = newBook;
    if (!this.book) return;
    const { body } = document;
    if (!this.element.parentNode) {
      body.appendChild(this.element);
    }

    body.classList.add(c('viewing'));
    this.element.classList.remove(...Object.keys(modeClasses).map(k => modeClasses[k]));
    this.element.classList.add(modeClasses[this.mode]);

    const scrollMax = body.scrollHeight - body.offsetHeight;
    const scrollPct = body.scrollTop / scrollMax;

    if (this.controls) this.controls.setDone(this.book.pages.length);
    this.progressBar.style.width = '100%';

    window.requestAnimationFrame(() => {
      const pages = this.book.pages.slice();

      let frag;
      if (this.mode === Mode.FLIPBOOK) frag = this.renderInteractive(pages);
      else if (this.mode === Mode.PRINT) frag = this.renderPrint(pages);
      else frag = this.renderGrid(pages);

      this.content.innerHTML = '';
      this.content.appendChild(frag);
      body.scrollTop = scrollMax * scrollPct;
      this.updateZoom();
    });
  }

  renderProgress(book) {
    this.book = book;

    this.progressBar.style.width = `${book.estimatedProgress * 100}%`;

    if (this.controls) {
      this.controls.updateProgress(book.pageCount, book.estimatedProgress);
    }

    const sideBySide =
      this.mode === Mode.PREVIEW
      || (this.mode === Mode.PRINT && this.printArrange !== Layout.PAGES);
    const limit = sideBySide ? 2 : 1;

    const makeSpread = function (...arg) {
      return createEl('.spread-wrapper.spread-size', [...arg]);
    };

    this.book.pages.forEach((page, i) => {
      // If hasn't been added, or not in spread yet
      if (!this.content.contains(page.element) || page.element.parentNode === this.content) {
        if (this.lastSpreadInProgress && this.lastSpreadInProgress.children.length < limit) {
          this.lastSpreadInProgress.appendChild(page.element);
        } else {
          if (i === 0 && sideBySide) {
            const spacer = new Page();
            spacer.element.style.visibility = 'hidden';
            this.lastSpreadInProgress = makeSpread(spacer.element, page.element);
          } else {
            this.lastSpreadInProgress = makeSpread(page.element);
          }
          this.content.appendChild(this.lastSpreadInProgress);
        }
      }
    });

    if (this.book.currentPage) {
      this.content.appendChild(this.book.currentPage.element);
    }

    this.updateZoom();
  }

  updateZoom() {
    if (this.content.firstElementChild) {
      const scrollPct = document.body.scrollTop / document.body.scrollHeight;
      const viewerRect = this.scaler.getBoundingClientRect();
      const contentW = this.content.getBoundingClientRect().width;
      const scale = Math.min(1, viewerRect.width / (contentW));

      this.scaler.style.transform = `scale(${scale})`;
      document.body.scrollTop = document.body.scrollHeight * scrollPct;
    }
  }

  renderPrint(bookPages) {
    let pages = bookPages;
    this.element.classList.add(c('show-bleed'));
    const isBooklet = this.printArrange === Layout.BOOKLET;
    if (this.printArrange === Layout.SPREADS) {
      pages = padPages(pages, () => new Page());
    } else if (isBooklet) {
      pages = orderPagesBooklet(pages, () => new Page());
    }
    return renderPrintLayout(pages, this.isTwoUp, isBooklet);
  }

  renderGrid(bookPages) {
    let pages = bookPages;
    this.element.classList.remove(c('show-bleed'));
    if (this.doubleSided) pages = padPages(pages, () => new Page());
    return renderGridLayout(pages, this.doubleSided);
  }

  renderInteractive(bookPages) {
    this.element.classList.remove(c('show-bleed'));
    const pages = padPages(bookPages, () => new Page());
    return renderFlipLayout(pages, this.doubleSided);
  }

}

class Split extends Rule {
  constructor(options) {
    options.toNext = options.toNext || 'split-to-next';
    options.fromPrevious = options.fromPrevious || 'split-from-previous';
    super(options);

    OptionType.validate(options, {
      name: 'Split',
      selector: OptionType.string,
      toNext: OptionType.string,
      fromPrevious: OptionType.string,
    });
  }
  get customToNextClass() {
    return this.toNext;
  }
  get customFromPreviousClass() {
    return this.fromPrevious;
  }
}

class Counter extends Rule {
  constructor(options) {
    super(options);
    this.selector = '*';
    this.counterValue = 0;
    OptionType.validate(options, {
      name: 'Counter',
      replaceEl: OptionType.string,
      resetEl: OptionType.string,
      incrementEl: OptionType.string,
      replace: OptionType.func,
    });
  }
  setup() {
    this.counterValue = 0;
  }
  beforeAdd(el) {
    if (el.matches(this.incrementEl)) {
      this.counterValue += 1;
    }
    if (el.matches(this.resetEl)) {
      this.counterValue = 0;
    }
    if (el.matches(this.replaceEl)) {
      return this.createReplacement(el);
    }
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
      throw Error('Bindery: Rule assumes element has been added but it has no parent.', element);
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
    OptionType.validate(options, {
      name: 'Footnote',
      selector: OptionType.string,
      replace: OptionType.func,
      render: OptionType.func,
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

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement

class PageReference extends Replace {
  constructor(options) {
    super(options);
    OptionType.validate(options, {
      name: 'PageReference',
      selector: OptionType.string,
      replace: OptionType.func,
      createTest: OptionType.func,
    });
  }
  afterAdd(elmt, book) {
    const test = this.createTest(elmt);
    if (test) {
      // Temporary, to make sure it'll fit
      const parent = elmt.parentNode;
      const tempClone = elmt.cloneNode(true);
      const tempNumbers = book.pagesForTest(test);
      const tempRanges = makeRanges(tempNumbers);
      const temp = this.replace(tempClone, tempRanges || '000');
      temp.classList.add(c('placeholder-pulse'));
      parent.replaceChild(temp, elmt);

      book.onComplete(() => {
        const tempParent = temp.parentNode;
        const finalClone = elmt.cloneNode(true);
        const pageNumbers = book.pagesForTest(test);
        const pageRanges = makeRanges(pageNumbers);
        const newEl = this.replace(finalClone, pageRanges);
        tempParent.replaceChild(newEl, temp);
      });

      return temp;
    }
    return elmt;
  }
  createTest(element) {
    let selector = element.getAttribute('href');
    if (selector) {
      selector = selector.replace('#', '');
      // extra resilient in case it starts with a number ie wikipedia
      selector = `[id="${selector}"]`;
      return el => el.querySelector(selector);
    }
    return null;
  }
  replace(original, number) {
    original.insertAdjacentHTML('beforeend', `, <span>${number}</span>`);
    return original;
  }
}

// Options:
// selector: String
// render: function (Page) => HTMLElement
// TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

class RunningHeader extends Rule {
  constructor(options = {}) {
    super(options);
    OptionType.validate(options, {
      name: 'RunningHeader',
      render: OptionType.func,
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

var Rules = {
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

const { PageBreak: PageBreak$2, PageReference: PageReference$2, Footnote: Footnote$2, FullBleedPage: FullBleedPage$2, FullBleedSpread: FullBleedSpread$2 } = Rules;

const replacer = (element, number) => {
  element.textContent = `${number}`;
  return element;
};

var defaultRules = [
  PageBreak$2({ selector: '[book-page-break="both"]', position: 'both' }),
  PageBreak$2({ selector: '[book-page-break="avoid"]', position: 'avoid' }),

  PageBreak$2({ selector: '[book-page-break="after"][book-page-continue="right"]', position: 'after', continue: 'right' }),
  PageBreak$2({ selector: '[book-page-break="after"][book-page-continue="left"]', position: 'after', continue: 'left' }),
  PageBreak$2({ selector: '[book-page-break="after"][book-page-continue="next"]', position: 'after', continue: 'next' }),

  PageBreak$2({ selector: '[book-page-break="before"][book-page-continue="right"]', position: 'before', continue: 'right' }),
  PageBreak$2({ selector: '[book-page-break="before"][book-page-continue="left"]', position: 'before', continue: 'left' }),
  PageBreak$2({ selector: '[book-page-break="before"][book-page-continue="next"]', position: 'before', continue: 'next' }),

  FullBleedPage$2({ selector: '[book-full-bleed="page"]' }),
  FullBleedSpread$2({ selector: '[book-full-bleed="spread"]' }),

  Footnote$2({
    selector: '[book-footnote-text]',
    render: (element, number) => {
      const txt = element.getAttribute('book-footnote-text');
      return `<i>${number}</i>${txt}`;
    },
  }),

  PageReference$2({
    selector: '[book-pages-with-text]',
    replace: replacer,
    createTest: (element) => {
      const term = element.getAttribute('book-pages-with-text').toLowerCase().trim();
      return (page) => {
        const txt = page.textContent.toLowerCase();
        return txt.includes(term);
      };
    },
  }),

  PageReference$2({
    selector: '[book-pages-with-selector]',
    replace: replacer,
    createTest: (element) => {
      const sel = element.getAttribute('book-pages-with-selector').trim();
      return page => page.querySelector(sel);
    },
  }),

  PageReference$2({
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

___$insertStyle(":root{--bindery-ui-bg:#f4f4f4;--bindery-ui-accent:#000;--bindery-ui-text:#000}@media screen{.📖-page{background:#fff;outline:1px solid #ddd;overflow:hidden}.📖-show-bleed .📖-page{box-shadow:none;outline:none;overflow:visible}.📖-page:after{content:\"\";position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:3}}li.continuation,p.continuation{text-indent:unset!important}li.continuation{list-style:none!important}.📖-out-of-flow{display:none}.📖-page{width:var(--bindery-page-width);height:var(--bindery-page-height);position:relative;display:flex;flex-direction:column;flex-wrap:nowrap}.📖-flow-box{position:relative;margin:60px 40px;margin-bottom:0;flex:1 1 auto;min-height:0}.📖-flow-content{padding:.1px;position:relative}.📖-footer{margin:60px 40px;margin-top:8pt;flex:0 1 auto;z-index:1}.📖-page-background{position:absolute;z-index:0;overflow:hidden}.📖-left>.📖-page-background{right:0}.📖-right>.📖-page-background{left:0}.📖-sup{font-size:.667em}.📖-footer,.📖-running-header{font-size:10pt}.📖-running-header{position:absolute;text-align:center;top:.25in}.📖-left .📖-running-header{left:18pt;text-align:left}.📖-right .📖-running-header{right:18pt;text-align:right}.📖-print-page{width:var(--bindery-sheet-width);height:var(--bindery-sheet-height)}.📖-page-size-rotated{height:var(--bindery-page-width);width:var(--bindery-page-height)}.📖-spread-size{height:var(--bindery-page-height);width:calc(var(--bindery-page-width) * 2)}.📖-spread-size-rotated{width:var(--bindery-page-height);height:calc(var(--bindery-page-width) * 2)}.📖-show-bleed-marks .📖-print-page .📖-spread-wrapper,.📖-show-crop .📖-print-page .📖-spread-wrapper{margin:calc(var(--bindery-bleed) + 12pt) auto}.📖-page-background{top:calc(-1 * var(--bindery-bleed));bottom:calc(-1 * var(--bindery-bleed));left:calc(-1 * var(--bindery-bleed));right:calc(-1 * var(--bindery-bleed))}.📖-flow-box,.📖-footer{margin-left:var(--bindery-margin-inner);margin-right:var(--bindery-margin-outer)}.📖-left .📖-flow-box,.📖-left .📖-footer{margin-left:var(--bindery-margin-outer);margin-right:var(--bindery-margin-inner)}.📖-left .📖-running-header{left:var(--bindery-margin-outer)}.📖-right .📖-running-header{right:var(--bindery-margin-outer)}.📖-flow-box{margin-top:var(--bindery-margin-top)}.📖-footer{margin-bottom:var(--bindery-margin-bottom)}.📖-spread.📖-right>.📖-page-background{left:calc(-100% - var(--bindery-bleed))}.📖-spread.📖-left>.📖-page-background{right:calc(-100% - var(--bindery-bleed))}.📖-left .📖-rotate-container.📖-rotate-outward,.📖-left .📖-rotate-container.📖-rotate-spread-clockwise,.📖-right .📖-rotate-container.📖-rotate-inward,.📖-rotate-container.📖-rotate-clockwise{transform:rotate(90deg) translate3d(0,-100%,0);transform-origin:top left}.📖-left .📖-rotate-container.📖-rotate-inward,.📖-left .📖-rotate-container.📖-rotate-spread-counterclockwise,.📖-right .📖-rotate-container.📖-rotate-outward,.📖-rotate-container.📖-rotate-counterclockwise{transform:rotate(-90deg) translate3d(-100%,0,0);transform-origin:top left}.📖-rotate-container{position:absolute}.📖-left .📖-rotate-container.📖-rotate-clockwise .📖-page-background{bottom:0}.📖-left .📖-rotate-container.📖-rotate-counterclockwise .📖-page-background,.📖-right .📖-rotate-container.📖-rotate-clockwise .📖-page-background{top:0}.📖-right .📖-rotate-container.📖-rotate-counterclockwise .📖-page-background,.📖-rotate-container.📖-rotate-inward .📖-page-background{bottom:0}.📖-rotate-container.📖-rotate-outward .📖-page-background{top:0}.📖-right .📖-rotate-container.📖-rotate-spread-clockwise{transform:rotate(90deg) translate3d(0,-50%,0);transform-origin:top left}.📖-right .📖-rotate-container.📖-rotate-spread-counterclockwise{transform:rotate(-90deg) translate3d(-100%,-50%,0);transform-origin:top left}@media screen{.📖-root{transition:opacity .2s;opacity:1;background:var(--bindery-ui-bg);z-index:2;position:relative;padding-top:72px;min-height:100vh}.📖-progress-bar{position:fixed;left:0;top:0;background:var(--bindery-ui-accent);width:0;transition:all .2s;opacity:0;height:0;z-index:2}.📖-in-progress .📖-progress-bar{opacity:1;height:2px}.📖-zoom-content{padding:10px;background:var(--bindery-ui-bg);position:absolute;left:0;right:0;margin:auto}.📖-view-preview .📖-zoom-content{min-width:calc(20px + var(--bindery-spread-width))}.📖-view-flip .📖-zoom-content{min-width:calc(1.1 * var(--bindery-spread-width))}.📖-view-print .📖-zoom-content{min-width:calc(20px + var(--bindery-sheet-width))}.📖-measure-area{position:fixed;background:var(--bindery-ui-bg);padding:50px 20px;z-index:2;visibility:hidden;left:0;right:0;bottom:0}.📖-measure-area .📖-page{margin:0 auto 50px}.📖-is-overflowing{border-bottom:1px solid #f0f}.📖-print-page{margin:0 auto}.📖-error{font:16px/1.4 -apple-system,BlinkMacSystemFont,Roboto,sans-serif;padding:15vh 15vw;z-index:3;position:fixed;top:0;left:0;right:0;bottom:0;background:hsla(0,0%,96%,.7)}.📖-error-title{font-size:1.5em;margin-bottom:16px}.📖-error-text{margin-bottom:16px;white-space:pre-line}.📖-error-footer{opacity:.5;font-size:.66em;text-transform:uppercase;letter-spacing:.02em}.📖-show-bleed .📖-print-page{background:#fff;outline:1px solid rgba(0,0,0,.1);box-shadow:0 1px 3px rgba(0,0,0,.2);margin:20px auto}.📖-placeholder-pulse{animation:pulse 1s infinite}}@keyframes pulse{0%{opacity:.2}50%{opacity:.5}to{opacity:.2}}@page{margin:0}@media print{.📖-root *{-webkit-print-color-adjust:exact;color-adjust:exact}.📖-controls{display:none!important}.📖-print-page{padding:1px;margin:0 auto}.📖-zoom-scaler[style]{transform:none!important}}body.viewing{margin:0}.📖-zoom-scaler{transform-origin:top left;transform-style:preserve-3d;height:calc(100vh - 120px)}.📖-view-flip .📖-zoom-scaler{transform-origin:center left}.📖-print-page{page-break-after:always;overflow:hidden;align-items:center;transition:all .2s}.📖-print-page,.📖-spread-wrapper{position:relative;display:flex;justify-content:center}.📖-spread-wrapper{margin:0 auto 32px}.📖-print-page .📖-spread-wrapper{margin:0 auto}.📖-flap-holder{perspective:5000px;position:absolute;top:0;right:0;left:0;bottom:0;margin:auto;transform-style:preserve-3d}.📖-flip-sizer{position:relative;margin:auto;padding:0 20px;box-sizing:content-box;height:90vh!important}.📖-page3d{margin:auto;width:var(--bindery-page-width);height:var(--bindery-page-height);transform:rotateY(0);transform-style:preserve-3d;transform-origin:left;transition:transform .5s,box-shadow .1s;position:absolute;left:0;right:0;top:0;bottom:0}.📖-page3d:hover{box-shadow:2px 0 4px rgba(0,0,0,.2)}.📖-page3d.📖-flipped{transform:rotateY(-180deg)}.📖-page3d .📖-page{position:absolute;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:none}.📖-page3d .📖-page3d-front{transform:rotateY(0)}.📖-page3d .📖-page3d-back{transform:rotateY(-180deg)}.📖-print-mark-wrap{display:none;position:absolute;pointer-events:none;top:0;bottom:0;left:0;right:0;z-index:3}.📖-show-bleed-marks .📖-print-mark-wrap,.📖-show-bleed-marks .📖-print-mark-wrap>[class*=bleed],.📖-show-crop .📖-print-mark-wrap,.📖-show-crop .📖-print-mark-wrap>[class*=crop]{display:block}.📖-print-mark-wrap>div{display:none;position:absolute;overflow:hidden}.📖-print-mark-wrap>div:after,.📖-print-mark-wrap>div:before{content:\"\";display:block;position:absolute}.📖-print-mark-wrap>div:before{top:0;left:0}.📖-print-mark-wrap>div:after{bottom:0;right:0}.📖-mark-bleed-left,.📖-mark-bleed-right,.📖-mark-crop-fold,.📖-mark-crop-left,.📖-mark-crop-right{width:1px;margin:auto}.📖-mark-bleed-left:after,.📖-mark-bleed-left:before,.📖-mark-bleed-right:after,.📖-mark-bleed-right:before,.📖-mark-crop-fold:after,.📖-mark-crop-fold:before,.📖-mark-crop-left:after,.📖-mark-crop-left:before,.📖-mark-crop-right:after,.📖-mark-crop-right:before{width:1px;height:var(--bindery-mark-length);background-image:linear-gradient(90deg,#000 0,#000 51%,transparent 0);background-size:1px 100%}.📖-mark-bleed-bottom,.📖-mark-bleed-top,.📖-mark-crop-bottom,.📖-mark-crop-top{height:1px}.📖-mark-bleed-bottom:after,.📖-mark-bleed-bottom:before,.📖-mark-bleed-top:after,.📖-mark-bleed-top:before,.📖-mark-crop-bottom:after,.📖-mark-crop-bottom:before,.📖-mark-crop-top:after,.📖-mark-crop-top:before{width:var(--bindery-mark-length);height:1px;background-image:linear-gradient(180deg,#000 0,#000 51%,transparent 0);background-size:100% 1px}.📖-mark-crop-fold{right:0;left:0}.📖-mark-crop-left{left:0}.📖-mark-crop-right{right:0}.📖-mark-crop-top{top:0}.📖-mark-crop-bottom{bottom:0}.📖-print-meta{padding:var(--bindery-mark-length);text-align:center;font-family:-apple-system,BlinkMacSystemFont,Roboto,sans-serif;font-size:8pt;display:block!important;position:absolute;bottom:-60pt;left:0;right:0}.📖-mark-bleed-left,.📖-mark-bleed-right,.📖-mark-crop-fold,.📖-mark-crop-left,.📖-mark-crop-right{top:calc(-1 * var(--bindery-mark-length) - var(--bindery-bleed));bottom:calc(-1 * var(--bindery-mark-length) - var(--bindery-bleed))}.📖-mark-bleed-bottom,.📖-mark-bleed-top,.📖-mark-crop-bottom,.📖-mark-crop-top{left:calc(-12pt - var(--bindery-bleed));right:calc(-12pt - var(--bindery-bleed))}.📖-mark-bleed-left{left:calc(-1 * var(--bindery-bleed))}.📖-mark-bleed-right{right:calc(-1 * var(--bindery-bleed))}.📖-mark-bleed-top{top:calc(-1 * var(--bindery-bleed))}.📖-mark-bleed-bottom{bottom:calc(-1 * var(--bindery-bleed))}");

/* global BINDERY_VERSION */

const parseHTML = (text, selector) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = text;
  return wrapper.querySelector(selector);
};

const T = OptionType;

class Bindery {
  constructor(opts = {}) {
    console.log(`📖 Bindery ${BINDERY_VERSION}`);

    if (!opts.content) {
      this.viewer.displayError('Content not specified', 'You must include a source element, selector, or url');
      console.error('Bindery: You must include a source element or selector');
      return;
    }

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;

    T.validate(opts, {
      name: 'makeBook',
      autorun: T.bool,
      content: T.any,
      ControlsComponent: T.any,
      pageSetup: T.shape({ name: 'pageSetup', bleed: T.length, margin: T.margin, size: T.size }),
      view: T.enum(...Object.values(Mode)),
      printSetup: T.shape({
        name: 'printSetup',
        layout: T.enum(...Object.values(Layout)),
        marks: T.enum(...Object.values(Marks)),
        paper: T.enum(...Object.values(Paper)),
      }),
      rules: T.array,
    });

    this.pageSetup = new PageSetup(opts.pageSetup);
    this.pageSetup.setupPaper(opts.printSetup);

    const startLayout = opts.printSetup ? opts.printSetup.layout || Layout.PAGES : Layout.PAGES;
    const startMarks = opts.printSetup ? opts.printSetup.marks || Marks.CROP : Marks.CROP;
    this.viewer = new Viewer({
      pageSetup: this.pageSetup,
      mode: opts.view || Mode.PREVIEW,
      marks: startMarks,
      layout: startLayout,
      ControlsComponent: opts.ControlsComponent,
    });

    this.rules = defaultRules;
    if (opts.rules) this.addRules(opts.rules);

    this.getSource(opts.content).then((src) => {
      this.source = src;
      if (src && this.autorun) this.makeBook();
    });
  }

  // Convenience constructor
  static makeBook(opts = {}) {
    opts.autorun = opts.autorun ? opts.autorun : true;
    return new Bindery(opts);
  }

  async getSource(content) {
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
      const url = content.url;
      const selector = content.selector;
      return this.fetchRemoteSource(url, selector);
    }
    throw Error('Bindery: Source must be an element or selector');
  }

  async fetchRemoteSource(url, selector) {
    const response = await fetch(url);
    if (response.status !== 200) {
      this.viewer.displayError(response.status, `Could not find file at "${url}"`);
      return null;
    }
    const fetchedContent = await response.text();
    const sourceNode = parseHTML(fetchedContent, selector);
    if (!(sourceNode instanceof HTMLElement)) {
      this.viewer.displayError(
        'Source not specified',
        `Could not find element that matches selector "${selector}"`
      );
      console.error(`Bindery: Could not find element that matches selector "${selector}"`);
      return null;
    }
    return sourceNode;
  }

  cancel() {
    this.viewer.cancel();
    document.body.classList.remove(c('viewing'));
    this.source.style.display = '';
  }

  addRules(newRules) {
    newRules.forEach((rule) => {
      if (rule instanceof Rules.Rule) {
        this.rules.push(rule);
      } else {
        throw Error(`Bindery: The following is not an instance of Bindery.Rule and will be ignored: ${rule}`);
      }
    });
  }

  async makeBook(doneBinding) {
    if (!this.source) {
      document.body.classList.add(c('viewing'));
      return;
    }

    if (!this.pageSetup.isSizeValid()) {
      this.viewer.displayError(
        'Page is too small', `Size: ${JSON.stringify(this.pageSize)} \n Margin: ${JSON.stringify(this.pageMargin)} \n Try adjusting the sizes or units.`
      );
      console.error('Bindery: Cancelled pagination. Page is too small.');
      return;
    }

    this.source.style.display = '';
    const content = this.source.cloneNode(true);
    this.source.style.display = 'none';

    this.layoutInProgress = true;
    this.viewer.clear(); // In case we're updating an existing layout
    document.body.classList.add(c('viewing'));
    this.pageSetup.updateStyleVars();
    this.viewer.setInProgress();

    try {
      const book = await paginate$1(
        content,
        this.rules,
        partialBook => this.viewer.renderProgress(partialBook)
      );
      this.viewer.render(book);
      this.layoutInProgress = false;
      if (doneBinding) doneBinding();
      this.viewer.element.classList.remove(c('in-progress'));
    } catch (e) {
      this.layoutInProgress = false;
      this.viewer.element.classList.remove(c('in-progress'));
      this.viewer.displayError('Layout couldn\'t complete', e);
      console.error(e);
    }
  }
}
Bindery.version = BINDERY_VERSION;

const BinderyWithRules = Object.assign(Bindery, Rules);
BinderyWithRules.View = Mode;
BinderyWithRules.Paper = Paper;
BinderyWithRules.Layout = Layout;
BinderyWithRules.Marks = Marks;

return BinderyWithRules;

})));
//# sourceMappingURL=bindery.umd.js.map
