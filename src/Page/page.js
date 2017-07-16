import h from "hyperscript";
import css from "style!css!./page.css";
import _ from "style!css!./measureArea.css";

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
  hasOverflowed() {
    let measureArea = document.querySelector(".bindery-measure-area");
    if (!measureArea) measureArea = document.body.appendChild(h(".bindery-measure-area"));

    if (this.element.parentNode !== measureArea) {
      measureArea.innerHTML = '';
      measureArea.appendChild(this.element);
    }

    let contentH = this.flowContent.getBoundingClientRect().height;
    let boxH = this.flowBox.getBoundingClientRect().height;

    // console.log(`contentH: ${contentH}, boxH: ${boxH}`);
    return contentH >= boxH;
  }
  setPreference(dir) {
    if (dir == "left") this.alwaysLeft = true;
    if (dir == "right") this.alwaysRight = true;
  }
  setOutOfFlow(bool) {
    this.outOfFlow = bool;
  }

  clone() {
    let newPage = new Page();
    newPage.flowContent.innerHTML = this.flowContent.cloneNode(true).innerHTML;
    newPage.footer.innerHTML      = this.footer.cloneNode(true).innerHTML;
    newPage.flowContent.insertAdjacentHTML("beforeend", "RESTORED");
    return newPage;
  }

  static setSize(size) {
    Page.W = size.width;
    Page.H = size.height;
  }
  static setMargin(margin) {
    var sheet = document.createElement('style')
    sheet.innerHTML = `
      [bindery-side="left"] .bindery-flowbox,
      [bindery-side="left"] .bindery-footer {
        margin-left: ${margin.outer}px;
        margin-right: ${margin.inner}px;
      }
      [bindery-side="right"] .bindery-flowbox,
      [bindery-side="right"] .bindery-footer {
        margin-left: ${margin.inner}px;
        margin-right: ${margin.outer}px;
      }
      .bindery-flowbox { margin-top: ${margin.top}px; }
      .bindery-footer { margin-bottom: ${margin.bottom}px; }
    `;
    document.body.appendChild(sheet);
  }
}

module.exports = Page;
