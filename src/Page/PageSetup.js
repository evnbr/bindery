import Page from '../Page';
import { isValidSize, parseVal } from '../utils/convertUnits';
import { c } from '../utils';
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
    const b = this.bleed;

    switch (this.sheetSizeMode) {
    case Paper.AUTO:
      return { width, height };
    case Paper.AUTO_BLEED:
      return {
        width: `calc(${width} + ${b} + ${b})`,
        height: `calc(${height} + ${b} + ${b})`,
      };
    case Paper.AUTO_MARKS:
      // TODO: 24pt marks is hardcoded
      return {
        width: `calc(${width} + ${b} + ${b} + 24pt)`,
        height: `calc(${height} + ${b} + ${b} + 24pt)`,
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
    this.updateStylesheet();
    return Page.isSizeValid();
  }

  spreadSizeStyle() {
    const w = parseVal(this.size.width);
    return {
      height: this.size.height,
      width: `${w.val * 2}${w.unit}`,
    };
  }

  updateStylesheet() {
    let sheet;
    const existing = document.querySelector('#binderyPageSetup');
    if (existing) {
      sheet = existing;
    } else {
      sheet = document.createElement('style');
      sheet.id = 'binderyPageSetup';
    }
    const w = parseVal(this.size.width);

    sheet.innerHTML = `
@page { size: ${this.sheetSize.width} ${this.sheetSize.height}; }
${c('.print-page')} { width: ${this.sheetSize.width}; height: ${this.sheetSize.height};}

${c('.show-crop')} ${c('.print-page')} ${c('.spread-wrapper')},
${c('.show-bleed-marks')} ${c('.print-page')} ${c('.spread-wrapper')} {
  margin: calc(${this.bleed} + 12pt) auto;
}
${c('.page-size')} {
  height: ${this.size.height};
  width: ${this.size.width};
}
${c('.page-size-rotated')} {
  height: ${this.size.width};
  width: ${this.size.height};
}
${c('.spread-size')} {
  height: ${this.size.height};
  width: ${w.val * 2}${w.unit};
}
${c('.spread-size-rotated')} {
  height: ${w.val * 2}${w.unit};
  width: ${this.size.height};
}
${c('.flowbox')},
${c('.footer')} {
  margin-left: ${this.margin.inner};
  margin-right: ${this.margin.outer};
}
${c('.left')} ${c('.flowbox')},
${c('.left')} ${c('.footer')} {
  margin-left: ${this.margin.outer};
  margin-right: ${this.margin.inner};
}

${c('.left')} ${c('.running-header')} {
  left: ${this.margin.outer};
}
${c('.right')} ${c('.running-header')} {
  right: ${this.margin.outer};
}

${c('.flowbox')} { margin-top: ${this.margin.top}; }
${c('.footer')}{ margin-bottom: ${this.margin.bottom}; }

${c('.bleed-left')},
${c('.bleed-right')},
${c('.crop-left')},
${c('.crop-right')},
${c('.crop-fold')} {
  top: calc( -12pt - ${this.bleed} );
  bottom: calc( -12pt - ${this.bleed} );
}

${c('.bleed-top')},
${c('.bleed-bottom')},
${c('.crop-top')},
${c('.crop-bottom')} {
  left: calc( -12pt - ${this.bleed} );
  right: calc( -12pt - ${this.bleed} );
}
${c('.bleed-left')}   { left: -${this.bleed}; }
${c('.bleed-right')}  { right: -${this.bleed}; }
${c('.bleed-top')}    { top: -${this.bleed}; }
${c('.bleed-bottom')} { bottom: -${this.bleed}; }

${c('.background')} {
  top: -${this.bleed};
  bottom: -${this.bleed};
  left: -${this.bleed};
  right: -${this.bleed};
}

${c('.spread')}${c('.right')} > ${c('.background')} {
  left: calc(-100% - ${this.bleed});
}
${c('.spread')}${c('.left')} > ${c('.background')} {
  right: calc(-100% - ${this.bleed});
}
    `;
    document.head.appendChild(sheet);
  }
}

export default PageSetup;
