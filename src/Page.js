import h from 'hyperscript';
import { parseVal } from './utils/convertUnits';
import { prefix, prefixClass } from './utils/prefixClass';

class Page {
  constructor() {
    this.flowContent = h(prefixClass('content'));
    this.flowBox = h(prefixClass('flowbox'), this.flowContent);
    this.footer = h(prefixClass('footer'));
    this.bleed = h(prefixClass('bleed'));
    this.element = h(prefixClass('page'),
      { style: Page.sizeStyle() },
      this.bleed,
      this.flowBox,
      this.footer,
    );
  }
  overflowAmount() {
    if (this.element.parentNode !== Page.measureArea) {
      if (!Page.measureArea) Page.measureArea = document.body.appendChild(h(prefixClass('measure-area')));

      if (this.element.parentNode !== Page.measureArea) {
        // Page.measureArea.innerHTML = '';
        Page.measureArea.appendChild(this.element);
      }
      if (Page.measureArea.parentNode !== document.body) {
        document.body.appendChild(Page.measureArea);
      }
    }

    const contentH = this.flowContent.offsetHeight;
    const boxH = this.flowBox.offsetHeight;

    if (boxH === 0) {
      throw Error('Bindery: Trying to flow into a box of zero height.');
    }

    return contentH - boxH;
  }
  hasOverflowed() {
    return this.overflowAmount() > -5;
  }

  static isSizeValid() {
    document.body.classList.remove('bindery-viewing');

    const testPage = new Page();
    let measureArea = document.querySelector(prefixClass('measure-area'));
    if (!measureArea) measureArea = document.body.appendChild(h(prefixClass('measure-area')));

    measureArea.innerHTML = '';
    measureArea.appendChild(testPage.element);
    const box = testPage.flowBox.getBoundingClientRect();

    measureArea.parentNode.removeChild(measureArea);

    return (box.height > 100) && (box.width > 100); // TODO: Number is arbitrary
  }

  setLeftRight(dir) {
    if (dir === 'left') {
      this.side = dir;
      this.element.classList.remove(prefix('right'));
      this.element.classList.add(prefix('left'));
    } else if (dir === 'right') {
      this.side = dir;
      this.element.classList.remove(prefix('left'));
      this.element.classList.add(prefix('right'));
    } else {
      throw Error(`Bindery: Setting page to invalid direction${dir}`);
    }
  }

  get suppressErrors() {
    return this.suppress || false;
  }

  set suppressErrors(newVal) {
    this.suppress = newVal;
    if (newVal) {
      this.element.classList.add(prefix('is-overflowing'));
    } else {
      this.element.classList.remove(prefix('is-overflowing'));
    }
  }

  get isEmpty() {
    return this.element.textContent.trim() === '';
  }

  get isLeft() {
    return this.side === 'left';
  }

  get isRight() {
    return this.side === 'right';
  }

  setPreference(dir) {
    if (dir === 'left') this.alwaysLeft = true;
    if (dir === 'right') this.alwaysRight = true;
  }

  setOutOfFlow(bool) {
    this.outOfFlow = bool;
  }

  clone() {
    const newPage = new Page();
    newPage.flowContent.innerHTML = this.flowContent.cloneNode(true).innerHTML;
    newPage.footer.innerHTML = this.footer.cloneNode(true).innerHTML;
    newPage.flowContent.insertAdjacentHTML('beforeend', 'RESTORED');
    return newPage;
  }

  static setSize(size) {
    Page.W = size.width;
    Page.H = size.height;
  }

  static sizeStyle() {
    return {
      height: Page.H,
      width: Page.W,
    };
  }
  static spreadSizeStyle() {
    const w = parseVal(Page.W);
    return {
      height: Page.H,
      width: `${w.val * 2}${w.unit}`,
    };
  }

  static setMargin(margin) {
    let sheet;
    const existing = document.querySelector('#bindery-margin-stylesheet');
    if (existing) {
      sheet = existing;
    } else {
      sheet = document.createElement('style');
      sheet.id = 'bindery-margin-stylesheet';
    }
    sheet.innerHTML = `
      .bindery-flowbox,
      .bindery-footer {
        margin-left: ${margin.inner};
        margin-right: ${margin.outer};
      }
      .bindery-left .bindery-flowbox,
      .bindery-left .bindery-footer {
        margin-left: ${margin.outer};
        margin-right: ${margin.inner};
      }

      .bindery-left .bindery-num,
      .bindery-left .bindery-running-header {
        left: ${margin.outer};
      }
      .bindery-right .bindery-num,
      .bindery-right .bindery-running-header {
        right: ${margin.outer};
      }

      .bindery-flowbox { margin-top: ${margin.top}; }
      .bindery-footer { margin-bottom: ${margin.bottom}; }
    `;
    document.head.appendChild(sheet);
  }
}

export default Page;
