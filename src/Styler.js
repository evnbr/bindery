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
      }
      ${c('.left')} ${c('.background')} {
        left: -${this.bleed};
      }
      ${c('.right')} ${c('.background')} {
        right: -${this.bleed};
      }

      ${c('.spread')}${c('.right')} ${c('.background')} {
        left: calc(-100% - ${this.bleed});
      }
      ${c('.spread')}${c('.left')} ${c('.background')} {
        right: calc(-100% - ${this.bleed});
      }
    `;
    document.head.appendChild(sheet);
  }
}

export default Styler;
