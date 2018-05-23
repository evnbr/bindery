// Bindery
import { Book, Page, orderPages, annotatePages } from '../book';

// paginate
import { isTextNode, isUnloadedImage, isContentElement } from './nodeTypes';
import { ignoreOverflow, canSplit } from './canSplit';
import { addTextNode, addTextNodeAcrossElements } from './addTextNode';
import tryInNextBox from './tryInNextBox';
import RuleSet from './RuleSet';
import estimate from './estimate';

const paginate = (content, rules, progressCallback) => {
  // Global state for a pagination run
  const estimator = estimate(content);
  const ruleSet = new RuleSet(rules);

  const book = new Book();
  const noSplit = ruleSet.selectorsNotToSplit;
  const canSplitElement = el => canSplit(el, noSplit);

  const hasOverflowed = () => book.currentPage.hasOverflowed();
  const ignoreCurrentOverflow = () => ignoreOverflow(book.currentPage.flow.currentElement);

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
    if (oldPage) {
      newPage.flow.continueFrom(oldPage.flow, ruleSet.splitClasses);
    }
    book.currentPage = newPage;
    book.pages.push(newPage);

    progressCallback(book, estimator.progress()); // assuming this will display new page
    newPage.validate(); // TODO: element must be in dom before validating
    return newPage;
  };

  const continuedFlow = () => {
    const newPage = continueOnNewPage();
    return newPage.flow;
  };

  const addTextWithoutChecks = (textNode, parent) => {
    parent.appendChild(textNode);
    if (!ignoreCurrentOverflow()) {
      book.currentPage.suppressErrors = true;
      continueOnNewPage();
    }
  };

  const addWholeTextNode = async (textNode) => {
    let hasAdded = await addTextNode(textNode, book.currentPage.flow.currentElement, hasOverflowed);
    if (!hasAdded && !ignoreCurrentOverflow()) {
      tryInNextBox(book.currentPage.flow, continuedFlow, canSplitElement);
      hasAdded = await addTextNode(textNode, book.currentPage.flow.currentElement, hasOverflowed);
    }
    if (!hasAdded) {
      addTextWithoutChecks(textNode, book.currentPage.flow.currentElement);
    }
  };

  const continuedElement = () => {
    const newPage = continueOnNewPage();
    return newPage.flow.currentElement;
  };

  const addSplittableTextNode = async (textNode) => {
    const el = book.currentPage.flow.currentElement;
    let hasAdded = await addTextNodeAcrossElements(textNode, el, continuedElement, hasOverflowed);
    if (!hasAdded && book.currentPage.flow.path.length > 1) {
      tryInNextBox(book.currentPage.flow, continuedFlow, canSplitElement);
      hasAdded = await addTextNodeAcrossElements(textNode, el, continuedElement, hasOverflowed);
    }
    if (!hasAdded) {
      addTextWithoutChecks(textNode, book.currentPage.flow.currentElement);
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
    book.currentPage.flow.currentElement.appendChild(element);
    book.currentPage.flow.path.push(element);

    // Clear element
    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    // Overflows when empty
    if (hasOverflowed() && !ignoreCurrentOverflow()) {
      tryInNextBox(book.currentPage.flow, continuedFlow, canSplitElement);
    }

    const shouldSplit = canSplitElement(element) && !ignoreOverflow(element);

    for (const child of childNodes) {
      if (isTextNode(child)) {
        await (shouldSplit ? addSplittableTextNode : addWholeTextNode)(child);
      } else if (isContentElement(child)) {
        await addElementNode(child);
      } else {
        // Skip comments and unknown nodes
      }
    }

    // Transforms after adding
    const addedElement = book.currentPage.flow.path.pop();
    ruleSet.applyAfterAddRules(addedElement, book, continueOnNewPage, makeNewPage);
    estimator.increment();
  };

  const init = async () => {
    if (!Page.isSizeValid()) throw Error('Page is too small');
    content.style.margin = 0;
    content.style.padding = 0;
    continueOnNewPage();

    await addElementNode(content);

    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);

    ruleSet.finishEveryPage(book);
    estimator.end();

    return book;
  };

  return init();
};


export default paginate;
