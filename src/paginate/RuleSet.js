import FullBleedPage from '../Rules/FullBleedPage';
import FullBleedSpread from '../Rules/FullBleedSpread';
import PageBreak from '../Rules/PageBreak';
import elToStr from '../utils/elementToString';


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
    this.pageRules = rules.filter(r => r.eachPage);
    this.beforeAddRules = rules.filter(r => r.selector && r.beforeAdd);
    this.afterAddRules = rules.filter(r => r.selector && r.afterAdd);
    this.selectorsNotToSplit = rules.filter(rule => rule.avoidSplit).map(rule => rule.selector);
  }
  setup() {
    this.rules.forEach((rule) => {
      if (rule.setup) rule.setup();
    });
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
              console.log(`Couldn't apply ${rule.name} to ${elToStr(problemElement)}. Caused overflows twice.`);
            }
          );
        }
      );
    });
    return addedElement;
  }
}

export default RuleSet;
