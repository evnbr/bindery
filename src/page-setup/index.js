import { stylesheet } from '../dom-utils';
import { parseLength } from '../css-length';

import { defaultPageSetup } from '../defaults';
import { Paper, Layout } from '../constants';

const letter = { width: '8.5in', height: '11in' };
const a4 = { width: '210mm', height: '297mm' };

const supportsCustomPageSize = !!window.chrome && !!window.chrome.webstore;

class PageSetup {
  constructor(opts = {}, printOpts = {}) {
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

    const bleedAmount = `2 * ${this.bleed}`;
    const marksAmount = `2 * ${this.bleed} + 2 * ${this.markLength}`;
    switch (this.paper) {
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
    const vars = Object.entries({
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
    }).map(([k, v]) => `--bindery-${k}: ${v};`).join('');

    const rootRule = `:root { ${vars}  }`;
    const pageRule = `@page { size: ${sheet.width} ${sheet.height}; }`;

    stylesheet('binderyPage').innerHTML = `${rootRule} ${pageRule}`;
  }
}

export default PageSetup;
