import { Rule } from './Rule';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';
import { Book } from '../book';
import { RegionGetter } from 'regionize/dist/types/types';
import { CSSSelector } from '../types';

export interface PageBreakRuleOptions {
  selector: CSSSelector;
  continue: 'next' | 'left' | 'right' | 'same';
  position: 'before' | 'after' | 'both' | 'avoid';
}

class PageBreak extends Rule {
  continue: 'next' | 'left' | 'right';
  position: 'before' | 'after' | 'both' | 'avoid';

  constructor(options: Partial<PageBreakRuleOptions>) {
    super(options);
    if (options.continue == 'same') {
      throw Error("Can't continue on the same pager after a Page Break ");
    }
    this.continue = options.continue ?? 'next';
    this.position = options.position ?? 'before';

    validateRuntimeOptions(options, {
      name: 'PageBreak',
      selector: RuntimeTypes.string,
      continue: RuntimeTypes.enum('next', 'left', 'right'),
      position: RuntimeTypes.enum('before', 'after', 'both', 'avoid'),
    });
  }
  get avoidSplit() {
    return this.position === 'avoid';
  }
  beforeAdd(elmt: HTMLElement, book: Book, continueOnNewPage: RegionGetter) {
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
  afterAdd(elmt: HTMLElement, book: Book, continueOnNewPage: RegionGetter) {
    if (this.position === 'after' || this.position === 'both') {
      continueOnNewPage();
      if (this.continue !== 'next') {
        book.currentPage.setPreference(this.continue);
      }
    }
    return elmt;
  }
}

export default PageBreak;
