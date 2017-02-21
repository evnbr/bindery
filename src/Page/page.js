import h from "hyperscript";
import css from "style!css!./page.css";

class Page {
  constructor(template) {
    this.element = h(".bindery-page",
      h(".bindery-flowbox",
        h(".bindery-content")
      ),
      h(".bindery-footer"),
    );
    this.flowBox = this.element.querySelector(".bindery-flowbox");
    this.flowContent = this.element.querySelector(".bindery-content");
    this.footer = this.element.querySelector(".bindery-footer");
  }
}

module.exports = Page;
