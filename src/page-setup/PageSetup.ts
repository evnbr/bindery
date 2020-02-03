import { stylesheet } from '../dom-utils';
import { parseLength } from '../css-length';

import defaultPageSetup from './defaultPageSetup';
import { Paper, Layout } from '../constants';

const letter = Object.freeze({ width: '8.5in', height: '11in' });
const a4 = Object.freeze({ width: '210mm', height: '297mm' });

// Not a really reliable way to know this
const supportsCustomPageSize = !!window.hasOwnProperty('chrome');

// TODO: Refactor type checks for CSS lengths etc
interface PageSetupOptions {
  size?: any;
  margin?: any;
}

interface PrintSetupOptions {
  paper?: number;
  bleed?: string;
  layout?: any;
}


class PageSetup {
  size: any;
  margin: any;
  paper: any;
  bleed: string;
  printTwoUp: boolean;
  markLength: string;

  constructor(opts: PageSetupOptions = {}, printOpts: PrintSetupOptions = {}) {
    this.size = opts.size || defaultPageSetup.size;
    this.margin = opts.margin || defaultPageSetup.margin;
    this.markLength = '12pt';

    this.paper = supportsCustomPageSize ? (printOpts.paper || Paper.AUTO) : Paper.AUTO_MARKS;
    this.bleed = printOpts.bleed || defaultPageSetup.bleed;
    this.printTwoUp = printOpts.layout && printOpts.layout !== Layout.PAGES;
  }

  get displaySize() {
    const width = this.printTwoUp ? this.spreadSize.width : this.size.width;
    const height = this.size.height;
    const bleed = this.bleed;

    return { width, height, bleed };
  }

  get sheetSize() {
    const width = this.printTwoUp ? this.spreadSize.width : this.size.width;
    const height = this.size.height;

    const doubleBleed = `2 * ${this.bleed}`;
    const doubleMarks = `${doubleBleed} + 2 * ${this.markLength}`;
    const singleMarks = `${this.bleed} + ${this.markLength}`;
    switch (this.paper) {
    case Paper.AUTO:
      return { width, height };
    case Paper.AUTO_BLEED:
      return {
        width: `calc(${width} + ${this.printTwoUp ? doubleBleed : this.bleed})`,
        height: `calc(${height} + ${doubleBleed})`,
      };
    case Paper.AUTO_MARKS:
      return {
        width: `calc(${width} + ${this.printTwoUp ? doubleMarks : singleMarks})`,
        height: `calc(${height} + ${doubleMarks})`,
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

  get spreadSize() {
    const w = parseLength(this.size.width);
    return {
      height: this.size.height,
      width: `${w.val * 2}${w.unit}`,
    };
  }

  updateStyleVars() {
    const page = this.size;
    const sheet = this.sheetSize;
    const vars = {
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
    };
    const str = Object.keys(vars).map(k => `--bindery-${k}: ${vars[k]};`).join('');

    const rootRule = `:root { ${str} }`;
    const pageRule = `@page { size: ${sheet.width} ${sheet.height}; }`;

    stylesheet('binderyPage').innerHTML = `${rootRule} ${pageRule}`;
  }
}

export default PageSetup;
