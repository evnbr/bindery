import Page from './Page';
import { isValidSize, parseVal } from './utils/convertUnits';
import c from './utils/prefixClass';

class Styler {

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
      ${c('.page-size')} {
        height: ${this.size.height};
        width: ${this.size.width};
      }
      ${c('.two-page-size')} {
        height: ${this.size.height};
        width: ${w.val * 2}${w.unit};
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
    `;
    document.head.appendChild(sheet);
  }
}

export default Styler;
