import h from 'hyperscript';

import Page from '../Page/page';
import errorView from './error';

require('./viewer.css');
require('./crop.css');

const MODE_FLIP = 'interactive';
const MODE_PREVIEW = 'grid';
const MODE_SHEET = 'print';
const MODE_OUTLINE = 'outline';

const ARRANGE_ONE = 'arrange_one';
const ARRANGE_SPREAD = 'arrange_two';
const ARRANGE_BOOKLET = 'arrange_booklet';
// const ARRANGE_SIGNATURE = 'arrange_signature';


const cropMarksSingle = () => h('.bindery-crop-wrap',
  h('.bindery-crop-top'),
  h('.bindery-crop-bottom'),
  h('.bindery-crop-left'),
  h('.bindery-crop-right'),
);
const cropMarksSpread = () => h('.bindery-crop-wrap',
  h('.bindery-crop-top'),
  h('.bindery-crop-bottom'),
  h('.bindery-crop-left'),
  h('.bindery-crop-right'),
  h('.bindery-crop-fold'),
);

const ORIENTATION_STYLE_ID = 'bindery-orientation-stylesheet';

const setOrientationCSS = (newValue) => {
  let sheet;
  const existing = document.querySelector(`#${ORIENTATION_STYLE_ID}`);
  if (existing) {
    sheet = existing;
  } else {
    sheet = document.createElement('style');
    sheet.id = ORIENTATION_STYLE_ID;
  }
  sheet.innerHTML = `@page { size: ${newValue}; }`;
  document.head.appendChild(sheet);
};


class Viewer {
  constructor() {
    this.pages = [];

    this.export = h('.bindery-export');

    this.doubleSided = true;
    this.printArrange = ARRANGE_SPREAD;
    this.isShowingCropMarks = true;
    this.setOrientation('landscape');

    this.mode = MODE_PREVIEW;
    this.currentLeaf = 0;

    this.listenForPrint();
  }

  listenForPrint() {
    // Automatically switch into print mode
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener((mql) => {
        if (mql.matches) {
          this.setPrint();
        } else {
              // after print
        }
      });
    }
  }

  get isShowingCropMarks() {
    return this.export.classList.contains('bindery-show-crop');
  }

  set isShowingCropMarks(newVal) {
    if (newVal) {
      this.export.classList.add('bindery-show-crop');
    } else {
      this.export.classList.remove('bindery-show-crop');
    }
  }

  setOrientation(newVal) {
    if (newVal === this.orientation) return;
    this.orientation = newVal;
    setOrientationCSS(newVal);
    if (this.mode === MODE_SHEET) {
      this.update();
    }
  }

  setPrintArrange(newVal) {
    if (newVal === this.printArrange) return;
    this.printArrange = newVal;
    if (this.mode === MODE_SHEET) {
      this.update();
    }
  }

  displayError(title, text) {
    if (!this.export.parentNode) {
      document.body.appendChild(this.export);
    }
    if (!this.error) {
      this.export.innerHTML = '';
      this.error = errorView(title, text);
      this.export.appendChild(this.error);
    }
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    if (this.export.parentNode) {
      this.export.parentNode.removeChild(this.export);
    }
  }
  toggleGuides() {
    this.export.classList.toggle('bindery-show-guides');
  }
  toggleBleed() {
    this.export.classList.add('bindery-show-bleed');
  }
  toggleDouble() {
    this.doubleSided = !this.doubleSided;
    this.update();
  }
  setMode(newMode) {
    switch (newMode) {
    case 'grid':
    case 'standard':
    case 'default':
      this.mode = MODE_PREVIEW;
      break;
    case 'interactive':
    case 'flip':
    case '3d':
      this.mode = MODE_FLIP;
      break;
    case 'print':
    case 'sheet':
      this.mode = MODE_SHEET;
      break;
    case 'outline':
    case 'outlines':
    case 'guides':
      this.mode = MODE_OUTLINE;
      break;
    default:
      console.error(`Bindery: Unknown view mode "${newMode}"`);
      break;
    }
  }
  setGrid() {
    if (this.mode === MODE_PREVIEW) return;
    if (this.mode === MODE_OUTLINE) {
      this.mode = MODE_PREVIEW;
      this.updateGuides();
    } else {
      this.mode = MODE_PREVIEW;
      this.update();
    }
  }
  setOutline() {
    if (this.mode === MODE_OUTLINE) return;
    if (this.mode === MODE_PREVIEW) {
      this.mode = MODE_OUTLINE;
      this.updateGuides();
    } else {
      this.mode = MODE_OUTLINE;
      this.update();
    }
  }
  setPrint() {
    if (this.mode === MODE_SHEET) return;
    this.mode = MODE_SHEET;
    this.update();
  }
  setInteractive() {
    this.mode = MODE_FLIP;
    this.update();
  }
  update() {
    if (!this.export.parentNode) {
      document.body.appendChild(this.export);
    }

    document.body.classList.add('bindery-viewing');

    if (this.mode === MODE_PREVIEW) {
      this.renderGrid();
    } else if (this.mode === MODE_OUTLINE) {
      this.renderGrid();
    } else if (this.mode === MODE_FLIP) {
      this.renderInteractive();
    } else if (this.mode === MODE_SHEET) {
      this.renderPrint();
    } else {
      this.renderGrid();
    }
  }

  renderPrint() {
    this.mode = MODE_SHEET;
    this.export.style.display = 'block';

    this.export.classList.add('bindery-show-bleed');
    this.export.classList.remove('bindery-show-guides');

    this.export.innerHTML = '';

    let pages = this.pages.slice();
    const isTwoUp = this.printArrange !== ARRANGE_ONE;

    const spread = function (...arg) {
      return h('.bindery-spread-wrapper', ...arg);
    };
    const orient = this.orientation;
    const printSheet = function (...arg) {
      return h(
        `.bindery-print-page.bindery-letter-${orient}`,
        ...arg
      );
    };

    if (this.printArrange === ARRANGE_SPREAD) {
      if (this.pages.length % 2 !== 0) {
        const pg = new Page();
        pages.push(pg);
      }
      const spacerPage = new Page();
      const spacerPage2 = new Page();
      spacerPage.element.style.visibility = 'hidden';
      spacerPage2.element.style.visibility = 'hidden';
      pages.unshift(spacerPage);
      pages.push(spacerPage2);
    }
    if (this.printArrange === ARRANGE_BOOKLET) {
      while (pages.length % 4 !== 0) {
        const spacerPage = new Page();
        spacerPage.element.style.visibility = 'hidden';
        pages.push(spacerPage);
      }
      const bookletOrder = [];
      const len = pages.length;

      for (let i = 0; i < len / 2; i += 2) {
        bookletOrder.push(pages[len - 1 - i]);
        bookletOrder.push(pages[i]);
        bookletOrder.push(pages[i + 1]);
        bookletOrder.push(pages[len - 2 - i]);
      }

      pages = bookletOrder;
    }


    for (let i = 0; i < pages.length; i += (isTwoUp ? 2 : 1)) {
      if (isTwoUp) {
        const left = pages[i];
        const right = pages[i + 1];

        const leftPage = left.element;
        const rightPage = right.element;

        const sheet = printSheet(spread(
          { style: Page.spreadSizeStyle() },
          leftPage, rightPage, cropMarksSpread()
        ));

        if (this.printArrange === ARRANGE_BOOKLET) {
          const isFront = i % 4 === 0;
          const sheetIndex = parseInt((i + 1) / 4, 10) + 1;
          const meta = h(
            '.bindery-print-meta',
            `Sheet ${sheetIndex} of ${pages.length / 4}: ${isFront ? 'Outside' : 'Inside'}`);
          sheet.appendChild(meta);
        }


        this.export.appendChild(sheet);
      } else {
        const pg = pages[i].element;
        const sheet = printSheet(spread(
          { style: Page.sizeStyle() },
          pg, cropMarksSingle()
        ));
        this.export.appendChild(sheet);
      }
    }
  }

  updateGuides() {
    if (this.mode === MODE_OUTLINE) {
      this.export.classList.add('bindery-show-bleed');
      this.export.classList.add('bindery-show-guides');
    } else {
      this.export.classList.remove('bindery-show-bleed');
      this.export.classList.remove('bindery-show-guides');
    }
  }

  renderGrid() {
    this.updateGuides();
    this.export.style.display = 'block';

    this.export.innerHTML = '';

    const pages = this.pages.slice();

    if (this.doubleSided) {
      if (this.pages.length % 2 !== 0) {
        const pg = new Page();
        pages.push(pg);
      }
      const spacerPage = new Page();
      const spacerPage2 = new Page();
      spacerPage.element.style.visibility = 'hidden';
      spacerPage2.element.style.visibility = 'hidden';
      pages.unshift(spacerPage);
      pages.push(spacerPage2);
    }


    for (let i = 0; i < pages.length; i += (this.doubleSided ? 2 : 1)) {
      if (this.doubleSided) {
        const left = pages[i];
        const right = pages[i + 1];

        const leftPage = left.element;
        const rightPage = right.element;


        const wrap = h('.bindery-spread-wrapper', {
          style: Page.spreadSizeStyle(),
        }, leftPage, rightPage
        );

        this.export.appendChild(wrap);
      } else {
        const pg = pages[i].element;
        pg.setAttribute('bindery-side', 'right');
        const wrap = h('.bindery-print-page',
          h('.bindery-spread-wrapper', {
            style: Page.sizeStyle(),
          }, pg),
        );
        this.export.appendChild(wrap);
      }
    }
  }
  renderInteractive() {
    this.mode = MODE_FLIP;
    this.export.style.display = 'block';
    this.export.innerHTML = '';
    this.flaps = [];

    this.export.classList.remove('bindery-show-bleed');
    this.export.classList.remove('bindery-show-guides');

    const pages = this.pages.slice();

    if (this.doubleSided) {
      if (this.pages.length % 2 !== 0) {
        const pg = new Page();
        pages.push(pg);
      }
    }
    const spacerPage = new Page();
    const spacerPage2 = new Page();
    spacerPage.element.style.visibility = 'hidden';
    spacerPage2.element.style.visibility = 'hidden';
    pages.unshift(spacerPage);
    pages.push(spacerPage2);

    let leafIndex = 0;
    for (let i = 1; i < pages.length - 1; i += (this.doubleSided ? 2 : 1)) {
      leafIndex += 1;
      const li = leafIndex;
      const flap = h('div.bindery-page3d', {
        style: Page.sizeStyle(),
        onclick: () => {
          let newLeaf = li - 1;
          if (newLeaf === this.currentLeaf) newLeaf += 1;
          this.setLeaf(newLeaf);
        },
      });
      this.export.classList.add('bindery-stage3d');
      this.flaps.push(flap);


      const rightPage = pages[i].element;
      let leftPage;
      rightPage.classList.add('bindery-page3d-front');
      flap.appendChild(rightPage);
      if (this.doubleSided) {
        flap.classList.add('bindery-doubleSided');
        leftPage = pages[i + 1].element;
        leftPage.classList.add('bindery-page3d-back');
        flap.appendChild(leftPage);
      } else {
        leftPage = h('.bindery-page.bindery-page3d-back', {
          style: Page.sizeStyle(),
        });
        flap.appendChild(leftPage);
      }
      // TODO: Dynamically add/remove pages.
      // Putting 1000s of elements onscreen
      // locks up the browser.

      let leftOffset = 4;
      if (pages.length * leftOffset > 300) leftOffset = 300 / pages.length;

      flap.style.left = `${i * leftOffset}px`;

      this.export.appendChild(flap);
    }
    if (this.currentLeaf) {
      this.setLeaf(this.currentLeaf);
    } else {
      this.setLeaf(0);
    }
  }
  setLeaf(n) {
    this.currentLeaf = n;
    let zScale = 4;
    if (this.flaps.length * zScale > 200) zScale = 200 / this.flaps.length;

    this.flaps.forEach((flap, i, arr) => {
      // + 0.5 so left and right are even
      const z = (arr.length - Math.abs((i - n) + 0.5)) * zScale;
      flap.style.transform = `translate3d(${(i < n) ? 4 : 0}px,0,${z}px) rotateY(${(i < n) ? -180 : 0}deg)`;
    });
  }
}

// const transition = (pct, a, b) => a + (pct * (b - a));
// const clamp = (val, min, max) => {
//   return (((val <= min) ? min : val) >= max) ? max : val;
// };
// const progress = (val, a, b) => (val - a) / (b - a);
// const progress01 = (val, a, b) => clamp(progress(val, a, b), 0, 1);
// const coords = (e) => ((e = e.touches && e.touches[0] || e), ({ x: e.pageX, y: e.pageY }));


export default Viewer;
