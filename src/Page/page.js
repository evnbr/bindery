import h from "hyperscript";
import css from "./page.css";
import css2 from "./measureArea.css";

class Page {
  constructor() {

    this.flowContent = h(".bindery-content");
    this.flowBox = h(".bindery-flowbox", this.flowContent);
    this.footer = h(".bindery-footer");
    this.bleed = h(".bindery-bleed");
    this.element = h(".bindery-page",
      { style: Page.sizeStyle() },
      this.bleed,
      this.flowBox,
      this.footer,
    );
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

  setLeftRight(dir) {
    if (dir == "left") {
      this.side = dir;
      this.element.classList.remove("bindery-right");
      this.element.classList.add("bindery-left");
    }
    else if (dir == "right") {
      this.side = dir;
      this.element.classList.remove("bindery-left");
      this.element.classList.add("bindery-right");
    }
    else {
      throw Error("Bindery: Setting page to invalid direction" + dir);
    }
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

  static sizeStyle() {
    return {
        height: `${Page.H}${Page.unit}`,
        width: `${Page.W}${Page.unit}`,
    }
  }
  static spreadSizeStyle() {
    return {
        height: `${Page.H}${Page.unit}`,
        width: `${Page.W * 2}${Page.unit}`,
    }
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
        margin-left: ${margin.inner}${Page.unit};
        margin-right: ${margin.outer}${Page.unit};
      }
      .bindery-left .bindery-flowbox,
      .bindery-left .bindery-footer {
        margin-left: ${margin.outer}${Page.unit};
        margin-right: ${margin.inner}${Page.unit};
      }
      .bindery-flowbox { margin-top: ${margin.top}${Page.unit}; }
      .bindery-footer { margin-bottom: ${margin.bottom}${Page.unit}; }
    `;
    document.head.appendChild(sheet);
  }
}

export default Page;
