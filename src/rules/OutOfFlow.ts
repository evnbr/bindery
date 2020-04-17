import { Rule } from './Rule';
import { Book } from '../book';
import { PageMaker } from '../types';
import { RegionGetter } from 'regionize/dist/types/types';

class OutOfFlow extends Rule {
  continue?: string;

  constructor(options: {}) {
    super(options);
    this.name = 'Out of Flow';
  }
  createOutOfFlowPages(elmt: any, book: Book, makeNewPage: PageMaker) {
    throw Error('createOutOfFlowPages must be overridden');
  }
  beforeAdd(elmt: HTMLElement) {
    // Avoid breaking inside this element. Once it's completely added,
    // it will moved onto the background layer.

    elmt.setAttribute('data-ignore-overflow', 'true');
    return elmt;
  }
  afterAdd(
    elmt: HTMLElement,
    book: Book,
    continueOnNewPage: RegionGetter,
    makeNewPage: PageMaker,
  ) {
    this.createOutOfFlowPages(elmt, book, makeNewPage);

    // Catches cases when we didn't need to create a new page. but unclear
    if (
      this.continue !== 'same' ||
      book.currentPage.state.hasOutOfFlowContent
    ) {
      continueOnNewPage();
      if (this.continue === 'left' || this.continue === 'right') {
        book.currentPage.setState({ preferredSide: this.continue });
      }
    }

    return elmt;
  }
}

export default OutOfFlow;
