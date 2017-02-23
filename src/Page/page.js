import h from "hyperscript";
import css from "style!css!./page.css";

class Page {
  constructor() {
    this.element = h(".bindery-page",
      { style: `height:${Page.H}px; width:${Page.W}px`},
      h(".bindery-flowbox",
        h(".bindery-content")
      ),
      h(".bindery-footer"),
    );
    this.flowBox = this.element.querySelector(".bindery-flowbox");
    this.flowContent = this.element.querySelector(".bindery-content");
    this.footer = this.element.querySelector(".bindery-footer");
  }
  static setSize(size) {
    Page.W = size.width;
    Page.H = size.height;
  }
}

// default page size
Page.H = 400;
Page.W = 300;

module.exports = Page;
