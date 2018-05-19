import Page from './Page';
import { stylesheet } from './utils';
import { parseVal } from './utils/convertUnits';
import { Paper, Layout } from './Constants';


const letter = { width: '8.5in', height: '11in' };
const a4 = { width: '210mm', height: '297mm' };
const defaultOpts = {
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
    this.size = opts.size || defaultOpts.size;
    this.margin = opts.margin || defaultOpts.margin;
    this.bleed = opts.bleed || defaultOpts.bleed;
    this.markLength = '12pt';
  }

  setupPaper(opts = {}) {
    this.sheetSizeMode = supportsCustomPageSize ? (opts.paper || Paper.AUTO) : Paper.AUTO_MARKS;
    this.printTwoUp = opts.layout && opts.layout !== Layout.PAGES;
  }

  setPrintTwoUp(newVal) {
    this.printTwoUp = newVal;
  }

  get displaySize() {
    const width = this.printTwoUp
      ? this.spreadSize.width
      : this.size.width;
    const height = this.size.height;
    const bleed = this.bleed;

    return { width, height, bleed };
  }

  get sheetSize() {
    const width = this.printTwoUp ? this.spreadSize.width : this.size.width;
    const height = this.size.height;

    const bleedAmount = `2 * ${this.bleed}`;
    const marksAmount = `2 * ${this.bleed} + 2 * ${this.markLength}`;
    switch (this.sheetSizeMode) {
    case Paper.AUTO:
      return { width, height };
    case Paper.AUTO_BLEED:
      return {
        width: `calc(${width} + ${bleedAmount})`,
        height: `calc(${height} + ${bleedAmount})`,
      };
    case Paper.AUTO_MARKS:
      return {
        width: `calc(${width} + ${marksAmount})`,
        height: `calc(${height} + ${marksAmount})`,
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

  get spreadSize() {
    const w = parseVal(this.size.width);
    return {
      height: this.size.height,
      width: `${w.val * 2}${w.unit}`,
    };
  }

  updateStyleVars() {
    const page = this.size;
    const sheet = this.sheetSize;
    stylesheet('pageSize').innerHTML = `@page { size: ${sheet.width} ${sheet.height}; }`;

    Object.entries({
      'spread-width': this.spreadSize.width,
      'page-width': page.width,
      'page-height': page.height,
      'sheet-width': sheet.width,
      'sheet-height': sheet.height,
      'margin-inner': this.margin.inner,
      'margin-outer': this.margin.outer,
      'margin-top': this.margin.top,
      'margin-bottom': this.margin.bottom,
      bleed: this.bleed,
      'mark-length': this.markLength,
    }).forEach(([k, v]) => {
      document.documentElement.style.setProperty(`--bindery-${k}`, v);
    });
  }
}

export default PageSetup;
