const MAXIMUM_PAGE_LIMIT = 2000;

class Book {
  constructor() {
    this.pages = [];
    this.isComplete = false;
    this.estimatedProgress = 0;
  }

  get pageCount() {
    return this.pages.length;
  }

  setCompleted() {
    this.isComplete = true;
    this.estimatedProgress = 1;
  }

  didAddPage() {
    this.validate();
  }

  validate() {
    if (this.pageCount > MAXIMUM_PAGE_LIMIT) {
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }
  }
}

export default Book;
