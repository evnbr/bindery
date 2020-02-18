import Rule, { RuleOptions } from './Rule';
import { Book, PageMaker } from '../book';

// Options:
// selector: String
// replace: function (HTMLElement) => HTMLElement

class Replace extends Rule {
  constructor(options: RuleOptions) {
    super(options);
    this.name = 'Replace';
  }
  afterAdd(element: HTMLElement, book: Book, continueOnNewPage: Function, makeNewPage: PageMaker, overflowCallback: Function) {
    const parent = element.parentNode;
    if (!parent) {
      console.error(element);
      throw Error(`Bindery.Replace({ selector: '${this.selector}' }).afterAdd called on element that hasn't been added.`);
    }
    const defensiveClone = element.cloneNode(true) as HTMLElement;
    const replacement = this.createReplacement(book, defensiveClone);
    parent.replaceChild(replacement, element);

    if (book.currentPage.hasOverflowed()) {
      parent.replaceChild(element, replacement);

      return overflowCallback(element);
    }

    return replacement;
  }
  createReplacement(book: Book, element: HTMLElement) {
    return this.replace(element);
  }
  replace(element: HTMLElement, info?: any) {
    element.insertAdjacentHTML('beforeend', '<sup class="bindery-sup">Default Replacement</sup>');
    return element;
  }
}

export default Replace;
