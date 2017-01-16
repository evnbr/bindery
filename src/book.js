class Book {
  constructor(opts) {

    this.pageNum = 1;
    this.pages = [];
  }
  addPage(page) {
    page.setNumber(this.pageNum);
    this.pageNum++;
    this.pages.push(page);
  }
}

module.exports = Book;
