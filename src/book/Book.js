import Page from './Page';
import orderPages from './orderPages';

const MAXIMUM_PAGE_LIMIT = 2000;

class Book {
  constructor() {
    this.rawPages = [];
    this.orderedPages = [];
  }

  addPage(newPage) {
    this.rawPages.push(newPage);
    this.updatePageOrder();
  }

  get pageCount() {
    return this.orderedPages.length;
  }

  get pages() {
    return this.orderedPages;
  }

  updatePageOrder() {
    this.orderedPages = orderPages(this.rawPages, () => new Page());
  }

  validate() {
    if (this.pageCount > MAXIMUM_PAGE_LIMIT) {
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }
  }
}

export default Book;
