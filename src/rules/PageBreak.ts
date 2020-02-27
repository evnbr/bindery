import { Rule, RuleOptions } from './Rule';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';
import { Book } from '../book';

class PageBreak extends Rule {
  continue: 'next' | 'left' | 'right' | 'same';
  position: 'before' | 'after' | 'both' | 'avoid';

  constructor(options: RuleOptions) {
    super(options);
    this.continue = options.continue ?? 'next';
    this.position = options.position ?? 'before';

    validateRuntimeOptions(options, {
      name: 'PageBreak',
      selector: RuntimeTypes.string,
      continue: RuntimeTypes.enum('next', 'left', 'right'),
      position: RuntimeTypes.enum('before', 'after', 'both', 'avoid')
    });
  }
  get avoidSplit() {
    return this.position === 'avoid';
  }
  beforeAdd(elmt: HTMLElement, book: Book, continueOnNewPage: Function) {
    if (this.position === 'before' || this.position === 'both') {
      if (!book.currentPage.isEmpty) {
        continueOnNewPage();
      }
      if (this.continue !== 'next' && this.continue !== 'same') {
        book.currentPage.setPreference(this.continue);
      }
    }
    return elmt;
  }
  afterAdd(elmt: HTMLElement, book: Book, continueOnNewPage: Function) {
    if (this.position === 'after' || this.position === 'both') {
      const newPage = continueOnNewPage(true);
      if (this.continue !== 'next') {
        newPage.setPreference(this.continue);
      }
    }
    return elmt;
  }
}

export default PageBreak;
