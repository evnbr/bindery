class Book {
  constructor(opts) {
    this.pages = [];
  }
  addPage(page) {
    this.pages.push(page);
  }
  number() {
    this.pages.forEach((pg, i) => {
      pg.pageNumber.textContent = (i + 1);
    });
  }
}

module.exports = Book;
