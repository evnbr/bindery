import h from 'hyperscript';
import c from '../utils/prefixClass';

import Page from '../Page';
import errorView from './error';

const MODE_FLIP = 'interactive';
const MODE_PREVIEW = 'grid';
const MODE_SHEET = 'print';
const MODE_OUTLINE = 'outline';

const ARRANGE_ONE = 'arrange_one';
const ARRANGE_SPREAD = 'arrange_two';
const ARRANGE_BOOKLET = 'arrange_booklet';
// const ARRANGE_SIGNATURE = 'arrange_signature';

const bleedMarks = () => [
  h(c('.bleed-top')),
  h(c('.bleed-bottom')),
  h(c('.bleed-left')),
  h(c('.bleed-right')),
];
const cropMarksSingle = () => h(c('.crop-wrap'),
  h(c('.crop-top')),
  h(c('.crop-bottom')),
  h(c('.crop-left')),
  h(c('.crop-right')),
  ...bleedMarks()
);
const cropMarksSpread = () => h(c('.crop-wrap'),
  h(c('.crop-top')),
  h(c('.crop-bottom')),
  h(c('.crop-left')),
  h(c('.crop-right')),
  h(c('.crop-fold')),
  ...bleedMarks()
);

const spread = function (...arg) {
  return h(c('.spread-wrapper'), ...arg);
};

const bookletMeta = (i, len) => {
  const isFront = i % 4 === 0;
  const sheetIndex = parseInt((i + 1) / 4, 10) + 1;
  return h(c('.print-meta'),
    `Sheet ${sheetIndex} of ${len / 4}: ${isFront ? 'Outside' : 'Inside'}`);
};


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

const orderPagesBooklet = (pages) => {
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

  return bookletOrder;
};

const padPages = (pages) => {
  if (pages.length % 2 !== 0) {
    const pg = new Page();
    pages.push(pg);
  }
  const spacerPage = new Page();
  const spacerPage2 = new Page();
  spacerPage.element.style.visibility = 'hidden';
  spacerPage2.element.style.visibility = 'hidden';
  pages.unshift(spacerPage);
  pages.push(spacerPage2);

  return pages;
};

const renderGridLayout = (pages, isTwoUp) => {
  const gridLayout = document.createDocumentFragment();
  if (isTwoUp) {
    for (let i = 0; i < pages.length; i += 2) {
      const wrap = spread(
        { style: Page.spreadSizeStyle() },
        pages[i].element, pages[i + 1].element
      );
      gridLayout.appendChild(wrap);
    }
  } else {
    pages.forEach((pg) => {
      const wrap = spread({ style: Page.sizeStyle() }, pg.element);
      gridLayout.appendChild(wrap);
    });
  }

  return gridLayout;
};

const renderPrintLayout = (pages, isTwoUp, orient, isBooklet) => {
  const printLayout = document.createDocumentFragment();

  const size = isTwoUp ? Page.spreadSizeStyle() : Page.sizeStyle();
  const cropMarks = isTwoUp ? cropMarksSpread : cropMarksSingle;

  const printSheet = function (...arg) {
    return h(c('.print-page') + c(`.letter-${orient}`),
      spread({ style: size }, ...arg, cropMarks())
    );
  };

  if (isTwoUp) {
    for (let i = 0; i < pages.length; i += 2) {
      const sheet = printSheet(pages[i].element, pages[i + 1].element);
      printLayout.appendChild(sheet);
      if (isBooklet) {
        const meta = bookletMeta(i, pages.length);
        sheet.appendChild(meta);
      }
    }
  } else {
    pages.forEach((pg) => {
      const sheet = printSheet(pg.element);
      printLayout.appendChild(sheet);
    });
  }

  return printLayout;
};

class Viewer {
  constructor() {
    this.book = null;

    this.zoomBox = h(c('.zoom-wrap'));
    const spinner = h(c('.spinner'));
    this.export = h(c('.export'), this.zoomBox, spinner);

    this.doubleSided = true;
    this.printArrange = ARRANGE_SPREAD;
    this.isShowingCropMarks = true;
    this.setOrientation('landscape');

    this.mode = MODE_PREVIEW;
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    document.body.appendChild(this.export);
  }

  // Automatically switch into print mode
  listenForPrint() {
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

  listenForResize() {
    window.addEventListener('resize', () => {
      if (!this.throttleResize) {
        this.updateZoom();
        this.throttleResize = setTimeout(() => {
          this.throttleResize = null;
        }, 20);
      }
    });
  }

  get isShowingCropMarks() {
    return this.export.classList.contains(c('show-crop'));
  }

  set isShowingCropMarks(newVal) {
    if (newVal) {
      this.export.classList.add(c('show-crop'));
    } else {
      this.export.classList.remove(c('show-crop'));
    }
  }

  setOrientation(newVal) {
    if (newVal === this.orientation) return;
    this.orientation = newVal;
    setOrientationCSS(newVal);
    if (this.mode === MODE_SHEET) {
      this.update();
    } else {
      this.setPrint();
    }
  }

  setPrintArrange(newVal) {
    if (newVal === this.printArrange) return;
    this.printArrange = newVal;
    if (this.mode === MODE_SHEET) {
      this.update();
    } else {
      this.setPrint();
    }
  }

  displayError(title, text) {
    if (!this.export.parentNode) {
      document.body.appendChild(this.export);
    }
    if (!this.error) {
      this.zoomBox.innerHTML = '';
      this.error = errorView(title, text);
      this.zoomBox.appendChild(this.error);
    }
  }
  clear() {
    this.book = null;
    this.zoomBox.innerHTML = '';
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    if (this.export.parentNode) {
      this.export.parentNode.removeChild(this.export);
    }
  }
  toggleGuides() {
    this.export.classList.toggle(c('show-guides'));
  }
  toggleBleed() {
    this.export.classList.add(c('show-bleed'));
  }
  toggleDouble() {
    this.doubleSided = !this.doubleSided;
    this.update();
  }
  setMode(newMode) {
    switch (newMode) {
    case 'grid':
    case 'default':
      this.mode = MODE_PREVIEW;
      break;
    case 'interactive':
    case 'flip':
      this.mode = MODE_FLIP;
      break;
    case 'print':
    case 'sheet':
      this.mode = MODE_SHEET;
      break;
    case 'outline':
    case 'outlines':
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
    if (!this.book) return;
    if (!this.export.parentNode) {
      document.body.appendChild(this.export);
    }

    this.flaps = [];
    document.body.classList.add(c('viewing'));
    document.body.setAttribute('bindery-view-mode', this.mode);

    const scrollPct = document.body.scrollTop / document.body.scrollHeight;

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

    document.body.scrollTop = document.body.scrollHeight * scrollPct;
    this.updateZoom();
  }

  updateZoom() {
    if (this.zoomBox.firstElementChild) {
      const scrollPct = document.body.scrollTop / document.body.scrollHeight;
      const exportW = this.zoomBox.getBoundingClientRect().width;
      const contentW = this.zoomBox.firstElementChild.getBoundingClientRect().width;

      const scale = Math.min(1, exportW / (contentW + 20));

      this.zoomBox.style.transform = `scale(${scale})`;
      document.body.scrollTop = document.body.scrollHeight * scrollPct;
    }
  }

  updateGuides() {
    document.body.setAttribute('bindery-view-mode', this.mode);
    if (this.mode === MODE_OUTLINE) {
      this.export.classList.add(c('show-bleed'));
      this.export.classList.add(c('show-guides'));
    } else {
      this.export.classList.remove(c('show-bleed'));
      this.export.classList.remove(c('show-guides'));
    }
  }

  renderPrint() {
    this.export.classList.add(c('show-bleed'));
    this.export.classList.remove(c('show-guides'));

    this.zoomBox.innerHTML = '';

    const isTwoUp = this.printArrange !== ARRANGE_ONE;
    const isBooklet = this.printArrange === ARRANGE_BOOKLET;
    const orient = this.orientation;

    let pages = this.book.pages.slice();
    if (this.printArrange === ARRANGE_SPREAD) {
      pages = padPages(pages);
    } else if (this.printArrange === ARRANGE_BOOKLET) {
      pages = orderPagesBooklet(pages);
    }

    const printLayout = renderPrintLayout(pages, isTwoUp, orient, isBooklet);
    this.zoomBox.appendChild(printLayout);
  }

  renderGrid() {
    this.updateGuides();
    this.zoomBox.innerHTML = '';

    let pages = this.book.pages.slice();

    if (this.doubleSided) {
      pages = padPages(pages);
    }

    const gridLayout = renderGridLayout(pages, this.doubleSided);
    this.zoomBox.appendChild(gridLayout);
  }

  renderInteractive() {
    this.zoomBox.innerHTML = '';
    this.flaps = [];

    this.export.classList.remove(c('show-bleed'));
    this.export.classList.remove(c('show-guides'));

    const pages = padPages(this.book.pages.slice());

    let leafIndex = 0;
    for (let i = 1; i < pages.length - 1; i += (this.doubleSided ? 2 : 1)) {
      leafIndex += 1;
      const li = leafIndex;
      const flap = h(c('.page3d'), {
        style: Page.sizeStyle(),
        onclick: () => {
          let newLeaf = li - 1;
          if (newLeaf === this.currentLeaf) newLeaf += 1;
          this.setLeaf(newLeaf);
        },
      });
      this.export.classList.add(c('stage3d'));
      this.flaps.push(flap);


      const rightPage = pages[i].element;
      let leftPage;
      rightPage.classList.add(c('page3d-front'));
      flap.appendChild(rightPage);
      if (this.doubleSided) {
        flap.classList.add(c('doubleSided'));
        leftPage = pages[i + 1].element;
        leftPage.classList.add(c('page3d-back'));
        flap.appendChild(leftPage);
      } else {
        leftPage = h(c('.page') + c('.page3d-back'), {
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

      this.zoomBox.appendChild(flap);
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

export default Viewer;
