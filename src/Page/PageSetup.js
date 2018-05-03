import Page from '../Page';
import { isValidSize, parseVal } from '../utils/convertUnits';
import { Paper, Layout } from '../Constants';


const letter = { width: '8.5in', height: '11in' };
const a4 = { width: '210mm', height: '297mm' };
const defaultPageSetup = {
  bleed: '12pt',
  size: { width: '4in', height: '6in' },
  margin: {
    inner: '24pt',
    outer: '24pt',
    bottom: '40pt',
    top: '48pt',
  },
};

const supportsCustomPageSize = !!window.chrome && !!window.chrome.webstore;

class PageSetup {

  constructor(opts = {}) {
    this.setSize(opts.size || defaultPageSetup.size);
    this.setMargin(opts.margin || defaultPageSetup.margin);
    this.setBleed(opts.bleed || defaultPageSetup.bleed);
  }

  setupPaper(opts = {}) {
    this.sheetSizeMode = supportsCustomPageSize ? (opts.paper || Paper.AUTO) : Paper.AUTO_MARKS;
    this.printTwoUp = opts.layout && opts.layout !== Layout.PAGES;
  }

  setSize(size) {
    isValidSize(size);
    this.size = size;
  }

  setMargin(margin) {
    isValidSize(margin);
    this.margin = margin;
  }

  setBleed(newBleed) {
    this.bleed = newBleed;
  }

  setPrintTwoUp(newVal) {
    this.printTwoUp = newVal;
  }

  get displaySize() {
    const width = this.printTwoUp
      ? this.spreadSizeStyle().width
      : this.size.width;
    const height = this.size.height;
    const bleed = this.bleed;

    return {
      width,
      height,
      bleed,
    };
  }

  get sheetSize() {
    const width = this.printTwoUp
      ? this.spreadSizeStyle().width
      : this.size.width;
    const height = this.size.height;

    switch (this.sheetSizeMode) {
    case Paper.AUTO:
      return { width, height };
    case Paper.AUTO_BLEED:
      return {
        width: `calc(${width} + 2 * var(--bleed))`,
        height: `calc(${height} + 2 * var(--bleed))`,
      };
    case Paper.AUTO_MARKS:
      // TODO: 24pt marks is hardcoded
      return {
        width: `calc(${width} + 2 * var(--bindery-bleed) + 2 * var(--bindery-mark-length))`,
        height: `calc(${height} + 2 * var(--bindery-bleed) + 2 * var(--bindery-mark-length))`,
      };
    case Paper.LETTER_LANDSCAPE:
      return { width: letter.height, height: letter.width };
    case Paper.LETTER_PORTRAIT:
      return letter;
    case Paper.A4_PORTRAIT:
      return a4;
    case Paper.A4_LANDSCAPE:
      return { width: a4.height, height: a4.width };
    default:
    }
    return { width, height };
  }

  isSizeValid() {
    this.updateStyleVars();
    return Page.isSizeValid();
  }

  spreadSizeStyle() {
    const w = parseVal(this.size.width);
    return {
      height: this.size.height,
      width: `${w.val * 2}${w.unit}`,
    };
  }

  updateStyleVars() {
    let sheet;
    const existing = document.querySelector('#binderyPageSetup');
    if (existing) {
      sheet = existing;
    } else {
      sheet = document.createElement('style');
      sheet.id = 'binderyPageSetup';
    }
    sheet.innerHTML = `html {
      --bindery-page-width: ${this.size.width};
      --bindery-page-height: ${this.size.height};
      --bindery-sheet-width: ${this.sheetSize.width};
      --bindery-sheet-height: ${this.sheetSize.height};
      --bindery-margin-inner: ${this.margin.inner};
      --bindery-margin-outer: ${this.margin.outer};
      --bindery-margin-top: ${this.margin.top};
      --bindery-margin-bottom: ${this.margin.bottom};
      --bindery-bleed: ${this.bleed};
      --bindery-mark-length: 12pt;
    }`;
    document.head.appendChild(sheet);
  }
}

export default PageSetup;
