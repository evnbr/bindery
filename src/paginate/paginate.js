// Bindery
import Book from './Book';
import Page from '../Page';

// paginate
import shouldIgnoreOverflow from './shouldIgnoreOverflow';
import { addTextNode, addTextNodeAcrossElements } from './addTextNode';
import RuleSet from './RuleSet';
import orderPages from './orderPages';
import annotatePages from './annotatePages';
import breadcrumbClone from './breadcrumbClone';
import Estimator from './Estimator';

// Utils
import elToStr from '../utils/elementToString';
import { c, last } from '../utils';
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
  let breadcrumb = []; // Keep track of position in original tree

  const currentElement = () => {
    if (breadcrumb.length > 0) return last(breadcrumb);
    return book.pageInProgress.flowContent;
  };
  const hasOverflowed = () => book.pageInProgress.hasOverflowed();
  const canSplitCurrentElement = () => !shouldIgnoreOverflow(currentElement());
  const canSplitElement = element =>
    isSplittable(element, ruleSet.selectorsNotToSplit)
    && !shouldIgnoreOverflow(element);

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
      const suspect = currentElement();
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
    const oldPage = book.pageInProgress;
    if (oldPage) finishPage(oldPage, ignoreOverflow);

    breadcrumb = breadcrumbClone(breadcrumb, rules);
    const newPage = makeNewPage();

    book.pageInProgress = newPage;
    book.pages.push(newPage);

    if (breadcrumb[0]) {
      newPage.flowContent.appendChild(breadcrumb[0]);
    }

    progressCallback(book);
    validateNewPage(newPage); // TODO: element must be in dom before validating
    return newPage;
  };

  // Shifts this element to the next page. If any of its
  // ancestors cannot be split across page, it will
  // step up the tree to find the first ancestor
  // that can be split, and move all of that descendants
  // to the next page.
  const moveCurrentElementToNextPage = () => {
    // So this node won't get cloned. TODO: this is unclear
    const nodeToMove = breadcrumb.pop();

    if (breadcrumb.length < 1) {
      throw Error('Bindery: Attempting to move the top-level element');
    }

    // find the nearest splittable parent
    let willMove = nodeToMove;
    const pathToRestore = [];
    while (breadcrumb.length > 1 && !isSplittable(currentElement(), ruleSet.selectorsNotToSplit)) {
      // console.log('Not OK to split:', currentElement());
      willMove = breadcrumb.pop();
      pathToRestore.unshift(willMove);
    }

    // Once a node is moved to a new page, it should no longer trigger another
    // move. otherwise tall elements will endlessly get shifted to the next page
    willMove.setAttribute('data-bindery-did-move', true);

    const parent = willMove.parentNode;
    parent.removeChild(willMove);

    if (breadcrumb.length > 1 && currentElement().textContent.trim() === '') {
      parent.appendChild(willMove);
      willMove = breadcrumb.pop();
      pathToRestore.unshift(willMove);
      willMove.parentNode.removeChild(willMove);
    }

    // If the page is empty when this node is removed,
    // then it won't help to move it to the next page.
    // Instead continue here until the node is done.
    if (!book.pageInProgress.isEmpty) {
      if (hasOverflowed()) {
        book.pageInProgress.suppressErrors = true;
      }
      continueOnNewPage();
    }

    // append moved node as first in new page
    currentElement().appendChild(willMove);

    // restore subpath
    pathToRestore.forEach((restore) => { breadcrumb.push(restore); });
    breadcrumb.push(nodeToMove);
  };

  const addTextWithoutChecks = (textNode, parent) => {
    parent.appendChild(textNode);
    if (canSplitCurrentElement()) {
      book.pageInProgress.suppressErrors = true;
      continueOnNewPage();
    }
  };

  const addWholeTextNode = async (textNode) => {
    let hasAdded = await addTextNode(textNode, currentElement(), hasOverflowed);
    if (!hasAdded && canSplitCurrentElement()) {
      // try on next page
      moveCurrentElementToNextPage();
      hasAdded = await addTextNode(textNode, currentElement(), hasOverflowed);
    }
    if (!hasAdded) {
      addTextWithoutChecks(textNode, currentElement());
    }
  };

  const continuedElement = () => {
    continueOnNewPage();
    return currentElement();
  };

  const addSplittableTextNode = async (textNode) => {
    const el = currentElement();
    let hasAdded = await addTextNodeAcrossElements(textNode, el, continuedElement, hasOverflowed);
    if (!hasAdded && breadcrumb.length > 1) {
      // try on next page
      moveCurrentElementToNextPage();
      hasAdded = await addTextNodeAcrossElements(textNode, el, continuedElement, hasOverflowed);
    }
    if (!hasAdded) {
      addTextWithoutChecks(textNode, currentElement());
    }
  };


  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = async (elementToAdd) => {
    if (hasOverflowed() && canSplitCurrentElement()) {
      book.pageInProgress.suppressErrors = true;
      continueOnNewPage();
    }

    // Ensure images are loaded before measuring
    if (isUnloadedImage(elementToAdd)) {
      await estimator.ensureImageLoaded(elementToAdd);
    }

    // Transforms before adding
    const element = ruleSet.applyBeforeAddRules(elementToAdd, book, continueOnNewPage, makeNewPage);

    // Insert element
    currentElement().appendChild(element);
    breadcrumb.push(element);

    // Clear element
    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    // Overflows when empty
    if (hasOverflowed() && canSplitCurrentElement()) {
      moveCurrentElementToNextPage();
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
    const addedChild = breadcrumb.pop();
    ruleSet.applyAfterAddRules(
      addedChild,
      book,
      continueOnNewPage,
      makeNewPage,
      (el) => {
        el.parentNode.removeChild(el);
        continueOnNewPage();
        currentElement().appendChild(el);
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
