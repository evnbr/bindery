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
  const canSplitCurrent = () => canSplitElement(book.currentPage.flow.currentElement);

  const hasOverflowed = () => book.currentPage.hasOverflowed();
  const ignoreCurrentOverflow = () => ignoreOverflow(book.currentPage.flow.currentElement);

  const makeNewPage = () => {
    const newPage = new Page();
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
      newPage.flow.continueFrom(oldPage.flow, ruleSet.applySplitRules);
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
    if (!ignoreCurrentOverflow() && canSplitCurrent()) {
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

  // TODO:
  // While this does catch overflows, it is pretty hacky to move the entire node to the next page.
  // - 1. there is no guarentee it will fit on the new page
  // - 2. if it had childNodes, those side effects will not be undone,
  // which means footnotes will get left on previous page.
  // - 3. if it is a large paragraph, it will leave a large gap. the
  // ideal approach would be to only need to invalidate the last line of text.
  const recoverFromRule = (el) => {
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
      } else {
        // Trying again worked
      }
    }
    const newPage = continueOnNewPage();
    newPage.flow.currentElement.appendChild(removed);
    if (popped) newPage.flow.path.push(popped);
  };


  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = async (elementToAdd) => {
    if (hasOverflowed() && !ignoreCurrentOverflow() && canSplitCurrent()) {
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
    if (hasOverflowed() && !ignoreCurrentOverflow() && canSplitCurrent()) {
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

    // Overflows when full
    if (hasOverflowed()) {
      if (!ignoreCurrentOverflow() && canSplitCurrent()) {
        tryInNextBox(book.currentPage.flow, continuedFlow, canSplitElement);
      } else {
        // Its okay that this element overflows
      }
    }

    // Transforms after adding
    const addedElement = book.currentPage.flow.path.pop();
    ruleSet.applyAfterAddRules(addedElement, book, continueOnNewPage, makeNewPage, recoverFromRule);
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
