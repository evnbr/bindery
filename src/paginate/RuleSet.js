import dedupe from './dedupeRules';
import recoverFromRule from './recoverFromRule';

const giveUp = (rule, el) => {
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
    this.didSplitRules = rules.filter(r => r.selector && r.didSplit);

    // setup
    rules.filter(r => r.setup).forEach(r => r.setup());

    this.applySplitRules = this.applySplitRules.bind(this);
  }

  applySplitRules(original, clone, nextChild, deepClone) {
    this.didSplitRules.filter(r => original.matches(r.selector)).forEach((rule) => {
      rule.didSplit(original, clone, nextChild, deepClone);
    });
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

  applyAfterAddRules(originalElement, book, continueOnNewPage, makeNewPage) {
    let addedElement = originalElement;

    const attemptRecovery = el => recoverFromRule(el, book, continueOnNewPage);
    const matchingRules = this.afterAddRules.filter(rule => addedElement.matches(rule.selector));
    const uniqueRules = dedupe(matchingRules);

    uniqueRules.forEach((rule) => {
      const retry = (el) => {
        attemptRecovery(el);
        return rule.afterAdd(el, book, continueOnNewPage, makeNewPage, () => giveUp(rule, el));
      };
      addedElement = rule.afterAdd(addedElement, book, continueOnNewPage, makeNewPage, retry);
    });
    return addedElement;
  }
}

export default RuleSet;
