class Book {
  constructor(opts) {
    this.pages = [];
  }
  addPage(page) {
    this.pages.push(page);
  }
}

module.exports = Book;
