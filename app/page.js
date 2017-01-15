class Page {
  constructor(template) {
    this.element = template.cloneNode(true);
    this.flowBox = this.element.querySelector("[bindery-flowbox]");
    this.flowContent = this.element.querySelector("[bindery-content]");
    this.footer = this.element.querySelector("[bindery-footer]");
  }
  setNumber(n) {
    let num = this.element.querySelector("[bindery-num]");
    num.textContent = n;
  }
}

module.exports = Page;
