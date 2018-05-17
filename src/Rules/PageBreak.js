import Rule from './Rule';
import { OptionType } from '../utils';

class PageBreak extends Rule {
  constructor(options) {
    options.position = options.position || 'before';
    options.continue = options.continue || 'next';
    super(options);

    OptionType.validate(options, {
      name: 'PageBreak',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'left', 'right'),
      position: OptionType.enum('before', 'after', 'both', 'avoid'),
    });
  }
  get avoidSplit() {
    return this.position === 'avoid';
  }
  beforeAdd(elmt, book, continueOnNewPage) {
    if (this.position === 'before' || this.position === 'both') {
      if (!book.currentPage.isEmpty) {
        continueOnNewPage();
      }
      if (this.continue !== 'next') {
        book.currentPage.setPreference(this.continue);
      }
    }
    return elmt;
  }
  afterAdd(elmt, book, continueOnNewPage) {
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
