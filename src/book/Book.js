const MAXIMUM_PAGE_LIMIT = 2000;

class Book {
  constructor() {
    this.pages = [];
  }

  get pageCount() {
    return this.pages.length;
  }

  validate() {
    if (this.pageCount > MAXIMUM_PAGE_LIMIT) {
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }
  }
}

export default Book;
