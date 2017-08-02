class Book {
  constructor() {
    this.pages = [];
    this.queued = [];
    this.isComplete = false;
  }
  get pageCount() {
    return this.pages.length;
  }

  // arguments: selector : String
  // return: pages : [ Int ]
  // if no matches: []
  pagesForSelector(sel) {
    const matches = [];
    this.pages.forEach((page) => {
      if (page.element.querySelector(sel)) {
        matches.push(page.number);
      }
    });
    return matches;
  }

  // arguments: selector : String
  // return: page : Int
  // if no matches: null
  firstPageForSelector(sel, callback) {
    this.onComplete(() => {
      const page = this.pagesForSelector(sel)[0];
      callback(page);
    });
  }

  onComplete(func) {
    if (!this.isComplete) {
      this.queued.push(func);
    } else {
      func();
    }
  }

  setCompleted() {
    this.isComplete = true;
    this.queued.forEach((func) => {
      func();
    });
  }
}

export default Book;
