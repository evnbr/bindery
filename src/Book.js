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
    return this.pagesForTest(page => page.element.querySelector(sel));
  }
  // arguments: testFunc : (element) => bool
  // return: pages : [ Int ]
  // if no matches: []
  pagesForTest(testFunc) {
    return this.pages.filter(pg => testFunc(pg.element)).map(pg => pg.number);
  }

  onComplete(func) {
    if (!this.isComplete) this.queued.push(func);
    else func();
  }

  setCompleted() {
    this.isComplete = true;
    this.queued.forEach((func) => {
      func();
    });
  }
}

export default Book;
