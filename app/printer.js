class Printer {
  constructor(opts) {
    this.book = opts.book;
    this.target = this.book.target;
    this.template = opts.template;
    this.printWrapper = document.createElement("div");
    this.printWrapper.setAttribute("bindery-print-wrapper", true);
  }
  setOrdered() {
    if (this.book.pages.length % 2 !== 0) {
      let pg = new Page(this.template);
      this.book.addPage(pg);
    }
    let spacerPage = new Page(this.template);
    let spacerPage2 = new Page(this.template);
    spacerPage.element.style.visibility = "hidden";
    spacerPage2.element.style.visibility = "hidden";
    this.book.pages.unshift(spacerPage);
    this.book.pages.push(spacerPage2);

    for (var i = 0; i < this.book.pages.length; i += 2) {
      let wrap = this.printWrapper.cloneNode(false);
      let l = this.book.pages[i].element;
      let r = this.book.pages[i+1].element;
      l.setAttribute("bindery-left", true);
      r.setAttribute("bindery-right", true);
      wrap.appendChild(l);
      wrap.appendChild(r);
      this.target.appendChild(wrap);
    }
  }
  setInteractive() {
    if (this.book.pages.length % 2 !== 0) {
      let pg = new Page(this.template);
      this.book.addPage(pg);
    }
    let spacerPage = new Page(this.template);
    let spacerPage2 = new Page(this.template);
    spacerPage.element.style.visibility = "hidden";
    spacerPage2.element.style.visibility = "hidden";
    this.book.pages.unshift(spacerPage);
    this.book.pages.push(spacerPage2);

    for (var i = 0; i < this.book.pages.length; i += 2) {
      let wrap = this.printWrapper.cloneNode(false);
      wrap.setAttribute("bindery-preview", true);
      let l = this.book.pages[i].element;
      let r = this.book.pages[i+1].element;
      l.setAttribute("bindery-left", true);
      r.setAttribute("bindery-right", true);
      wrap.appendChild(l);
      wrap.appendChild(r);
      this.target.appendChild(wrap);
    }
  }
}

module.exports = Printer;
