import h from "hyperscript";
import css from "./page.css";
import css2 from "./measureArea.css";

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
  overflowAmount() {

    if (this.element.offsetParent === null) {
      let measureArea = document.querySelector(".bindery-measure-area");
      if (!measureArea) measureArea = document.body.appendChild(h(".bindery-measure-area"));

      if (this.element.parentNode !== measureArea) {
        measureArea.innerHTML = '';
        measureArea.appendChild(this.element);
      }
    }
    let contentH = this.flowContent.getBoundingClientRect().height;
    let boxH = this.flowBox.getBoundingClientRect().height;

    if (boxH == 0) {
      console.error(`Bindery: Trying to flow into a box of zero height.`)
    }

    return contentH - boxH;

  }
  hasOverflowed() {
    return this.overflowAmount() > -5
  }

  static isSizeValid() {
    document.body.classList.remove("bindery-viewing");

    let testPage = new Page()
    let measureArea = document.querySelector(".bindery-measure-area");
    if (!measureArea) measureArea = document.body.appendChild(h(".bindery-measure-area"));

    measureArea.innerHTML = '';
    measureArea.appendChild(testPage.element);
    let box = testPage.flowBox.getBoundingClientRect();

    measureArea.parentNode.removeChild(measureArea)

    return (box.height > 100) && (box.width > 100) // TODO: Number is arbitrary
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
    let sheet;
    let existing = document.querySelector("#bindery-margin-stylesheet");
    if (existing) {
      sheet = existing;
    }
    else {
      sheet = document.createElement('style');
      sheet.id = "bindery-margin-stylesheet";
    }
    sheet.innerHTML = `
      .bindery-flowbox,
      .bindery-footer {
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
    document.head.appendChild(sheet);
  }
}

export default Page;
