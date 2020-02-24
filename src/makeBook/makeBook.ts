import { flowIntoRegions } from 'regionize';
import { RegionGetter } from 'regionize/dist/types/types';

import { Book, Page, annotatePages } from '../book';
import { Rule } from '../rules/Rule';

// paginate
import RuleSet from './RuleSet';
import estimateFor from './estimateProgress';

const makeBook = async (content: HTMLElement, rules: Rule[], updateProgress: Function) => {
  if (!Page.isSizeValid()) throw Error('Page is too small');

  const estimator = estimateFor(content);
  const ruleSet = new RuleSet(rules);
  const book = new Book();
  const pageNumberOffset = ruleSet.pageNumberOffset;

  const makeNewPage = () => new Page();

  const finishPage = (page: Page, allowOverflow: boolean) => {
    // finished with this page, can display
    book.updatePageOrder();
    annotatePages(book.pages, pageNumberOffset);
    ruleSet.applyPageDoneRules(page, book);
    page.validateEnd(allowOverflow);
    book.validate();
  };

  const addPageToBook = (allowOverflow = false) => {
    const oldPage = book.currentPage;
    if (oldPage) finishPage(oldPage, allowOverflow);

    const newPage = makeNewPage();
    book.currentPage = newPage;
    book.addPage(newPage);

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
  const canSplit = (element: HTMLElement): boolean => {
    if (dontSplitSel.some(sel => element.matches(sel))) {
      return false;
    }
    if (element.parentElement) return canSplit(element.parentElement);
    return true;
  };

  const beforeAdd = (elementToAdd: HTMLElement, continueInNextRegion: RegionGetter) => {
    ruleSet.applyBeforeAddRules(elementToAdd, book, continueInNextRegion, makeNewPage);
  };

  const afterAdd = (addedElement: HTMLElement, continueInNextRegion: RegionGetter) => {
    estimator.increment();
    return ruleSet.applyAfterAddRules(addedElement, book, continueInNextRegion, makeNewPage);
  };

  // init
  content.style.margin = '0';
  content.style.padding = '0';

  await flowIntoRegions({
    content,
    createRegion: makeNextRegion,
    applySplit,
    canSplit,
    beforeAdd,
    afterAdd,
    shouldTraverse: ruleSet.shouldTraverse,
    didWaitFor: t => estimator.addWaitTime(t),
  });

  book.updatePageOrder();
  annotatePages(book.pages, pageNumberOffset);

  ruleSet.finishEveryPage(book);
  estimator.end();
  return book;
};


export default makeBook;
