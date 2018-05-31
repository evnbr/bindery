// Bindery
import { Book, Page, orderPages, annotatePages } from '../book';

// paginate
import RuleSet from './RuleSet';
import estimateFor from './estimateProgress';
import { canSplit } from './canSplit';
import flowIntoBoxes from './flowIntoBoxes';


const makeBook = async (content, rules, updateProgress) => {
  if (!Page.isSizeValid()) throw Error('Page is too small');

  const estimator = estimateFor(content);
  const ruleSet = new RuleSet(rules);
  const book = new Book();

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
    book.currentPage = newPage;
    book.pages.push(newPage);

    updateProgress(book, estimator.progress);
    newPage.validate();
    return newPage;
  };

  const nextBox = () => {
    const newPage = continueOnNewPage();
    return newPage.flow;
  };

  const applySplit = ruleSet.applySplitRules;
  const canSplitEl = el => canSplit(el, ruleSet.selectorsNotToSplit);

  const beforeAdd = (elementToAdd, continueInNextBox) => {
    return ruleSet.applyBeforeAddRules(elementToAdd, book, continueInNextBox, makeNewPage);
  };

  const afterAdd = (addedElement, continueInNextBox) => {
    estimator.increment();
    return ruleSet.applyAfterAddRules(addedElement, book, continueInNextBox, makeNewPage);
  };

  // init
  content.style.margin = 0;
  content.style.padding = 0;

  await flowIntoBoxes(content, nextBox, applySplit, canSplitEl, beforeAdd, afterAdd);

  book.pages = orderPages(book.pages, makeNewPage);
  annotatePages(book.pages);

  ruleSet.finishEveryPage(book);
  estimator.end();
  return book;
};


export default makeBook;
