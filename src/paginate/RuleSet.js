import dedupe from './dedupeRules';

const warn = (rule, el) => {
  console.warn(`Couldn't apply ${rule.name} to the following element, Caused overflows twice:`, el);
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

    this.splitClasses = {
      toNext: rules.map(rule => rule.customToNextClass).filter(cl => cl && cl !== ''),
      fromPrev: rules.map(rule => rule.customFromPreviousClass).filter(cl => cl && cl !== ''),
    };
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
