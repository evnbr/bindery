import dedupe from './dedupeRules';

const warn = (rule, el) => {
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
    this.splitClasses = {
      toNext: rules.map(rule => rule.toNext).filter(cl => cl && cl !== ''),
      fromPrev: rules.map(rule => rule.fromPrevious).filter(cl => cl && cl !== ''),
    };

    // setup
    rules.filter(r => r.setup).forEach(r => r.setup());
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

  // TODO:
  // While this does catch overflows, it is pretty hacky to move the entire node to the next page.
  // - 1. there is no guarentee it will fit on the new page
  // - 2. if it had childNodes, those side effects will not be undone,
  // which means footnotes will get left on previous page.
  // - 3. if it is a large paragraph, it will leave a large gap. the
  // ideal approach would be to only need to invalidate the last line of text.

  applyAfterAddRules(originalElement, book, continueOnNewPage, makeNewPage) {
    let addedElement = originalElement;

    const matchingRules = this.afterAddRules.filter(rule => addedElement.matches(rule.selector));
    const uniqueRules = dedupe(matchingRules);

    const shiftToNext = (el) => {
      el.parentNode.removeChild(el);
      const newPage = continueOnNewPage();
      newPage.flow.currentElement.appendChild(el);
    };

    uniqueRules.forEach((rule) => {
      const retry = (el) => {
        shiftToNext(el);
        return rule.afterAdd(el, book, continueOnNewPage, makeNewPage, () => warn(rule, el));
      };
      addedElement = rule.afterAdd(addedElement, book, continueOnNewPage, makeNewPage, retry);
    });
    return addedElement;
  }
}

export default RuleSet;
