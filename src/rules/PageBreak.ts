import Rule, { RuleOptions } from './Rule';
import { validate, T } from '../option-checker';
import { Book, PageMaker } from '../book';

class PageBreak extends Rule {
  continue: 'next' | 'left' | 'right' | 'same' = 'next';
  position: 'before' | 'after' | 'both' | 'avoid' = 'before';

  constructor(options: RuleOptions) {
    super(options);

    validate(options, {
      name: 'PageBreak',
      selector: T.string,
      continue: T.enum('next', 'left', 'right'),
      position: T.enum('before', 'after', 'both', 'avoid'),
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
