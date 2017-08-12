import h from 'hyperscript';
import c from '../utils/prefixClass';

import Page from '../Page';
import Controls from '../Controls';

import errorView from './error';
import { gridLayout, printLayout, flipLayout } from '../Layouts';

const MODE_FLIP = 'interactive';
const MODE_PREVIEW = 'grid';
const MODE_SHEET = 'print';
const MODE_OUTLINE = 'outline';

const ARRANGE_ONE = 'arrange_one';
const ARRANGE_SPREAD = 'arrange_two';
const ARRANGE_BOOKLET = 'arrange_booklet';
// const ARRANGE_SIGNATURE = 'arrange_signature';


const setOrientationCSS = (newValue) => {
  let sheet;
  const existing = document.querySelector('#binderyPrintSetup');
  if (existing) {
    sheet = existing;
  } else {
    sheet = document.createElement('style');
    sheet.id = 'binderyPrintSetup';
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


class Viewer {
  constructor({ bindery }) {
    this.book = null;

    this.zoomBox = h(c('.zoom-wrap'));
    const spinner = h(c('.spinner'));
    this.element = h(c('.root'), this.zoomBox, spinner);

    this.doubleSided = true;
    this.printArrange = ARRANGE_SPREAD;
    this.isShowingCropMarks = true;
    this.isShowingBleedMarks = false;
    this.setOrientation('landscape');

    this.mode = MODE_PREVIEW;
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    this.setGrid = this.setGrid.bind(this);
    this.setOutline = this.setOutline.bind(this);
    this.setPrint = this.setPrint.bind(this);
    this.setFlip = this.setFlip.bind(this);

    this.controls = new Controls({ binder: bindery, viewer: this });

    this.element.appendChild(this.controls.element);
    document.body.appendChild(this.element);
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
    return this.element.classList.contains(c('show-crop'));
  }

  set isShowingCropMarks(newVal) {
    if (newVal) {
      this.element.classList.add(c('show-crop'));
    } else {
      this.element.classList.remove(c('show-crop'));
    }
  }
  get isShowingBleedMarks() {
    return this.element.classList.contains(c('show-bleed-marks'));
  }

  set isShowingBleedMarks(newVal) {
    if (newVal) {
      this.element.classList.add(c('show-bleed-marks'));
    } else {
      this.element.classList.remove(c('show-bleed-marks'));
    }
  }


  setOrientation(newVal) {
    if (newVal === this.orientation) return;
    this.orientation = newVal;
    setOrientationCSS(newVal);
    if (this.mode === MODE_SHEET) {
      this.render();
    } else {
      this.setPrint();
    }
  }

  setPrintArrange(newVal) {
    if (newVal === this.printArrange) return;
    this.printArrange = newVal;
    if (this.mode === MODE_SHEET) {
      this.render();
    } else {
      this.setPrint();
    }
  }

  displayError(title, text) {
    if (!this.element.parentNode) {
      document.body.appendChild(this.element);
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
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
  toggleGuides() {
    this.element.classList.toggle(c('show-guides'));
  }
  toggleBleed() {
    this.element.classList.add(c('show-bleed'));
  }
  toggleDouble() {
    this.doubleSided = !this.doubleSided;
    this.render();
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
      this.render();
    }
  }
  setOutline() {
    if (this.mode === MODE_OUTLINE) return;
    if (this.mode === MODE_PREVIEW) {
      this.mode = MODE_OUTLINE;
      this.updateGuides();
    } else {
      this.mode = MODE_OUTLINE;
      this.render();
    }
  }
  setPrint() {
    if (this.mode === MODE_SHEET) return;
    this.mode = MODE_SHEET;
    this.render();
  }
  setFlip() {
    this.mode = MODE_FLIP;
    this.render();
  }
  render() {
    if (!this.book) return;
    if (!this.element.parentNode) {
      document.body.appendChild(this.element);
    }

    this.flaps = [];
    document.body.classList.add(c('viewing'));
    this.element.setAttribute('bindery-view-mode', this.mode);

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
    this.element.setAttribute('bindery-view-mode', this.mode);
    if (this.mode === MODE_OUTLINE) {
      this.element.classList.add(c('show-bleed'));
      this.element.classList.add(c('show-guides'));
    } else {
      this.element.classList.remove(c('show-bleed'));
      this.element.classList.remove(c('show-guides'));
    }
  }

  renderPrint() {
    this.element.classList.add(c('show-bleed'));
    this.element.classList.remove(c('show-guides'));

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

    const fragment = printLayout(pages, isTwoUp, orient, isBooklet);
    this.zoomBox.appendChild(fragment);
  }

  renderGrid() {
    this.updateGuides();
    this.zoomBox.innerHTML = '';

    let pages = this.book.pages.slice();

    if (this.doubleSided) pages = padPages(pages);

    const fragment = gridLayout(pages, this.doubleSided);
    this.zoomBox.appendChild(fragment);
  }

  renderInteractive() {
    this.zoomBox.innerHTML = '';
    this.flaps = [];

    this.element.classList.remove(c('show-bleed'));
    this.element.classList.remove(c('show-guides'));
    this.zoomBox.classList.add(c('stage3d'));

    const pages = padPages(this.book.pages.slice());

    const fragment = flipLayout(pages, this.doubleSided);
    this.zoomBox.appendChild(fragment);
  }

}

export default Viewer;
