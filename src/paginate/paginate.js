// Bindery
import Book from './Book';
import Page from '../Page';

// paginate
import shouldIgnoreOverflow from './shouldIgnoreOverflow';
import shiftToNextPage from './shiftToNextPage';
import { addTextNode, addTextNodeAcrossElements } from './addTextNode';
import RuleSet from './RuleSet';
import orderPages from './orderPages';
import annotatePages from './annotatePages';
import breadcrumbClone from './breadcrumbClone';
import Estimator from './Estimator';

// Utils
import elToStr from '../utils/elementToString';
import { c } from '../utils';
import { isTextNode, isUnloadedImage, isContent } from './nodeTypes';

const MAXIMUM_PAGE_LIMIT = 2000;

// Walk up the tree to see if we can safely
// insert a split into this node.
const isSplittable = (element, selectorsNotToSplit) => {
  if (selectorsNotToSplit.some(sel => element.matches(sel))) {
    if (element.hasAttribute('data-bindery-did-move')
      || element.classList.contains(c('continuation'))) {
      return true; // ignore rules and split it anyways.
    }
    return false;
  }
  if (element.parentElement) {
    return isSplittable(element.parentElement, selectorsNotToSplit);
  }
  return true;
};

const validateCompletedPage = (page, ignoreOverflow) => {
  if (page.hasOverflowed()) {
    console.warn(`Bindery: Page ~${page.number} is overflowing`, page.element);
    if (!page.suppressErrors && !ignoreOverflow) {
      throw Error('Bindery: Moved to new page when last one is still overflowing');
    }
  }
};

const paginate = (content, rules, progressCallback) => {
  // Global state for a pagination run
  const estimator = new Estimator();
  const ruleSet = new RuleSet(rules);
  const book = new Book();

  const hasOverflowed = () => book.currentPage.hasOverflowed();
  const canSplitCurrentElement = () => !shouldIgnoreOverflow(book.currentPage.currentElement);
  const canSplitElement = element =>
    isSplittable(element, ruleSet.selectorsNotToSplit)
    && !shouldIgnoreOverflow(element);
  const canSplitElementAlt = element =>
    isSplittable(element, ruleSet.selectorsNotToSplit);

  const makeNewPage = () => {
    const newPage = new Page();
    ruleSet.applyPageStartRules(newPage, book);
    return newPage;
  };

  const finishPage = (page, ignoreOverflow) => {
    // finished with this page, can display
    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);
    ruleSet.applyPageDoneRules(page, book);
    validateCompletedPage(page, ignoreOverflow);
  };

  const validateNewPage = (page) => {
    if (page.hasOverflowed()) {
      const suspect = page.currentElement;
      if (suspect) {
        console.warn(`Bindery: Content overflows, probably due to a style set on ${elToStr(suspect)}.`);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.warn('Bindery: Content overflows.');
      }
    }
    if (book.pages.length > MAXIMUM_PAGE_LIMIT) {
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }
  };

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  const continueOnNewPage = (ignoreOverflow = false) => {
    const oldPage = book.currentPage;
    if (oldPage) finishPage(oldPage, ignoreOverflow);

    const newPage = makeNewPage();
    newPage.breadcrumb = oldPage ? breadcrumbClone(oldPage.breadcrumb, rules) : [];

    book.currentPage = newPage;
    book.pages.push(newPage);

    if (newPage.breadcrumb[0]) {
      newPage.flowContent.appendChild(newPage.breadcrumb[0]);
    }

    progressCallback(book);
    validateNewPage(newPage); // TODO: element must be in dom before validating
    return newPage;
  };

  const addTextWithoutChecks = (textNode, parent) => {
    parent.appendChild(textNode);
    if (canSplitCurrentElement()) {
      book.currentPage.suppressErrors = true;
      continueOnNewPage();
    }
  };

  const addWholeTextNode = async (textNode) => {
    let hasAdded = await addTextNode(textNode, book.currentPage.currentElement, hasOverflowed);
    if (!hasAdded && canSplitCurrentElement()) {
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
    if (!hasAdded && book.currentPage.breadcrumb.length > 1) {
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
    if (hasOverflowed() && canSplitCurrentElement()) {
      book.currentPage.suppressErrors = true;
      continueOnNewPage();
    }

    // Ensure images are loaded before measuring
    if (isUnloadedImage(elementToAdd)) {
      await estimator.ensureImageLoaded(elementToAdd);
    }

    // Transforms before adding
    const element = ruleSet.applyBeforeAddRules(elementToAdd, book, continueOnNewPage, makeNewPage);

    // Insert element
    book.currentPage.currentElement.appendChild(element);
    book.currentPage.breadcrumb.push(element);

    // Clear element
    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    // Overflows when empty
    if (hasOverflowed() && canSplitCurrentElement()) {
      shiftToNextPage(book.currentPage, continueOnNewPage, canSplitElementAlt);
    }

    const shouldSplit = canSplitElement(element);

    for (const child of childNodes) {
      if (isTextNode(child)) {
        await (shouldSplit ? addSplittableTextNode : addWholeTextNode)(child, element);
      } else if (isContent(child)) {
        await addElementNode(child);
      } else {
        // Skip comments and unknown nodes
      }
    }

    // Transforms after adding
    const addedChild = book.currentPage.breadcrumb.pop();
    ruleSet.applyAfterAddRules(
      addedChild,
      book,
      continueOnNewPage,
      makeNewPage,
      (el) => {
        el.parentNode.removeChild(el);
        const newPage = continueOnNewPage();
        newPage.currentElement.appendChild(el);
      }
    );
    estimator.increment();
    book.estimatedProgress = estimator.progress;
  };


  const init = async () => {
    estimator.capacity = content.querySelectorAll('*').length;
    estimator.start();
    ruleSet.setup();
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


export default paginate;
