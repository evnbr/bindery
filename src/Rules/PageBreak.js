import Rule from './Rule';
import { OptionType } from '../utils';

class PageBreak extends Rule {
  constructor(options) {
    options.position = options.position || 'before';
    options.continue = options.continue || 'any';
    super(options);

    this.name = 'Page Break';
    OptionType.validate(options, {
      selector: OptionType.string,
      continue: OptionType.enum('any', 'left', 'right'),
      position: OptionType.enum('before', 'after', 'both', 'avoid'),
    });
  }
  get avoidSplit() {
    return this.position === 'avoid';
  }
  beforeAdd(elmt, book, requestNewPage) {
    if (this.position === 'before' || this.position === 'both') {
      if (!book.pageInProgress.isEmpty) {
        requestNewPage();
      }
      if (this.continue !== 'any') {
        book.pageInProgress.setPreference(this.continue);
      }
    }
    return elmt;
  }
  afterAdd(elmt, book, requestNewPage) {
    if (this.position === 'after' || this.position === 'both') {
      const newPage = requestNewPage();
      if (this.continue !== 'any') {
        newPage.setPreference(this.continue);
      }
    }
    return elmt;
  }
}

export default PageBreak;
