import { stylesheet } from '../dom-utils';
import { parseLength } from '../css-length';

import defaultPageSetup from './defaultPageSetup';
import { SheetSize, SheetLayout } from '../constants';

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
  paper?: SheetSize;
  bleed?: string;
  layout?: SheetLayout;
}


class PageSetup {
  size: any;
  margin: any;
  paper: SheetSize;
  bleed: string;
  printTwoUp: boolean;
  markLength: string;

  constructor(opts: PageSetupOptions = {}, printOpts: PrintSetupOptions = {}) {
    this.size = opts.size || defaultPageSetup.size;
    this.margin = opts.margin || defaultPageSetup.margin;
    this.markLength = '12pt';

    this.paper = supportsCustomPageSize ? (printOpts.paper || SheetSize.Auto) : SheetSize.AutoMarks;
    this.bleed = printOpts.bleed || defaultPageSetup.bleed;
    this.printTwoUp = !!printOpts.layout && (printOpts.layout !== SheetLayout.PAGES);
  }

  get displaySize(): { width: string, height: string, bleed: string } {
    const width = this.printTwoUp ? this.spreadSize.width : this.size.width;
    const height = this.size.height;
    const bleed = this.bleed;

    return { width, height, bleed };
  }

  get sheetSize(): { width: string, height: string } {
    const width = this.printTwoUp ? this.spreadSize.width : this.size.width;
    const height = this.size.height;

    const doubleBleed = `2 * ${this.bleed}`;
    const doubleMarks = `${doubleBleed} + 2 * ${this.markLength}`;
    const singleMarks = `${this.bleed} + ${this.markLength}`;

    switch (this.paper) {
    case SheetSize.Auto:
      return { width, height };
    case SheetSize.AutoBleed:
      return {
        width: `calc(${width} + ${this.printTwoUp ? doubleBleed : this.bleed})`,
        height: `calc(${height} + ${doubleBleed})`,
      };
    case SheetSize.AutoMarks:
      return {
        width: `calc(${width} + ${this.printTwoUp ? doubleMarks : singleMarks})`,
        height: `calc(${height} + ${doubleMarks})`,
      };
    case SheetSize.LetterLandscape:
      return { width: letter.height, height: letter.width };
    case SheetSize.LetterPortait:
      return letter;
    case SheetSize.A4Portrait:
      return a4;
    case SheetSize.A4Landscape:
      return { width: a4.height, height: a4.width };
    default:
      throw Error(`Can't get dimensions for unknown paper size: ${this.paper}`);
    }
  }

  get spreadSize(): { width: string, height: string } {
    const w = parseLength(this.size.width);
    return {
      height: this.size.height,
      width: `${w.val * 2}${w.unit}`,
    };
  }

  updateStyleVars() {
    const page = this.size;
    const sheet = this.sheetSize;
    const cssVariables = {
      'spread-width': this.spreadSize.width,
      'page-width': page.width,
      'page-height': page.height,
      'sheet-width': sheet.width,
      'sheet-height': sheet.height,
      'margin-inner': this.margin.inner,
      'margin-outer': this.margin.outer,
      'margin-top': this.margin.top,
      'margin-bottom': this.margin.bottom,
      'bleed': this.bleed,
      'mark-length': this.markLength,
    };
    const cssStr = Object.entries(cssVariables).map(([k, v]) => {
      return `--bindery-${k}: ${v};`
    }).join('');

    const rootRule = `:root { ${cssStr} }`;
    const pageRule = `@page { size: ${sheet.width} ${sheet.height}; }`;

    stylesheet('binderyPage').innerHTML = `${rootRule} ${pageRule}`;
  }
}

export default PageSetup;
