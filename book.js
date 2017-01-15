class Book {
  constructor(opts) {
    this.target = opts.target;
    this.pageNum = 1;
    this.pages = [];
  }
  addPage(page) {
    page.setNumber(this.pageNum);
    this.pageNum++;
    this.pages.push(page);
  }
}
