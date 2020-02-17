import { classes } from '../dom-utils';
import Rule from '../rules/Rule';
import Split from '../rules/Split';
import dedupe from './dedupeRules';
import recoverFromRule from './recoverFromRule';
import { Book, Page, PageMaker } from '../book';

const giveUp = (rule: Rule, el: HTMLElement) => {
  console.warn(`Couldn't apply ${rule.name}, caused overflows twice when adding: `, el);
};

interface PageRule extends Rule {
  eachPage: (pg: Page, book: Book) => void;
}
interface BeforeAddRule extends Rule {
  selector: string;
  beforeAdd: (a, b, c, d) => HTMLElement;
}
interface AfterAddRule extends Rule {
  selector: string;
  afterAdd: (a, b, c, d, e) => HTMLElement;
}
interface OffsetRule extends Rule {
  pageNumberOffset: number;
}
interface AvoidSplitRule extends Rule {
  avoidSplit: boolean;
}
interface DidSplitRule extends Rule {
  didSplit: (a: HTMLElement, b: HTMLElement) => void;
}

function isPageRule (rule: Rule): rule is PageRule {
  return rule.hasOwnProperty('eachPage');
}
function isBeforeAddRule (rule: Rule): rule is BeforeAddRule {
  return !!rule.selector && rule.hasOwnProperty('beforeAdd');
}
function isAfterAddRule (rule: Rule): rule is AfterAddRule {
  return !!rule.selector && rule.hasOwnProperty('afterAdd');
}
function isOffsetRule (rule: Rule): rule is OffsetRule {
  return rule.hasOwnProperty('pageNumberOffset');
}
function isDidSplitRule (rule: Rule): rule is DidSplitRule {
  return !!rule.selector && rule.hasOwnProperty('didSplit');
}


class RuleSet {
  pageNumberOffset: number;
  pageRules: PageRule[];
  beforeAddRules: BeforeAddRule[];
  afterAddRules: AfterAddRule[];
  didSplitRules: DidSplitRule[];
  selectorsNotToSplit: string[];
  shouldTraverse: (el: HTMLElement) => boolean;

  constructor(rules: Rule[]) {
    const offsetRule = rules.find(isOffsetRule);
    this.pageNumberOffset = offsetRule ? offsetRule.pageNumberOffset : 0;

    // Rules for pages
    this.pageRules = rules.filter(isPageRule);

    // Rules for elements
    this.beforeAddRules = rules.filter(isBeforeAddRule);
    this.afterAddRules = rules.filter(isAfterAddRule);

    // Rules for layout
    this.selectorsNotToSplit = rules.filter(r => r.avoidSplit).map(r => r.selector);
    this.didSplitRules = rules.filter(isDidSplitRule);

    // setup
    rules.filter(r => r.setup).forEach(r => r.setup());

    this.applySplitRules = this.applySplitRules.bind(this);

    const allSelectors = rules.map(r => r.selector).filter(sel => !!sel).join(', ');
    if (allSelectors) {
      const shouldTraverse = (el: HTMLElement) => !!el.querySelector(allSelectors);
      this.shouldTraverse = shouldTraverse.bind(this);
    } else {
      this.shouldTraverse = () => false;
    }
  }

  applySplitRules(original: HTMLElement, clone: HTMLElement) {
    original.classList.add(classes.toNext);
    clone.classList.add(classes.fromPrev);

    this.didSplitRules.filter(r => original.matches(r.selector)).forEach((rule) => {
      rule.didSplit(original, clone);
    });
  }

  // Rules for pages
  applyPageDoneRules(pg: Page, book: Book) {
    this.pageRules.forEach(rule => rule.eachPage(pg, book));
  }
  finishEveryPage(book: Book) {
    this.pageRules.forEach(rule => book.pages.forEach(pg => rule.eachPage(pg, book)));
  }

  // Rules for elements
  applyBeforeAddRules(element: HTMLElement, book: Book, continueOnNewPage: Function, makeNewPage: PageMaker) {
    let addedElement = element;

    const matchingRules = this.beforeAddRules.filter(rule => addedElement.matches(rule.selector));

    matchingRules.forEach((rule) => {
      addedElement = rule.beforeAdd(addedElement, book, continueOnNewPage, makeNewPage);
    });
    return addedElement;
  }

  applyAfterAddRules(originalElement: HTMLElement, book: Book, continueOnNewPage: Function, makeNewPage: PageMaker) {
    let addedElement = originalElement;

    const attemptRecovery = (el: HTMLElement) => recoverFromRule(el, book, continueOnNewPage);
    const matchingRules = this.afterAddRules.filter(rule => addedElement.matches(rule.selector));
    const uniqueRules = dedupe(matchingRules) as AfterAddRule[];

    uniqueRules.forEach((rule) => {
      const retry = (el: HTMLElement) => {
        attemptRecovery(el);
        return rule.afterAdd(el, book, continueOnNewPage, makeNewPage, () => giveUp(rule, el));
      };
      addedElement = rule.afterAdd(addedElement, book, continueOnNewPage, makeNewPage, retry);
    });
    return addedElement;
  }
}

export default RuleSet;
