import h from 'hyperscript';
import { c } from '../utils';

import Controls from './Controls';
import Page from '../Page';

import errorView from './error';
import orderPagesBooklet from './orderPagesBooklet';
import padPages from './padPages';
import { gridLayout, printLayout, flipLayout } from './Layouts';

const MODE_FLIP = 'interactive';
const MODE_PREVIEW = 'grid';
const MODE_SHEET = 'print';

const ARRANGE_ONE = 'arrange_one';
const ARRANGE_SPREAD = 'arrange_two';
const ARRANGE_BOOKLET = 'arrange_booklet';

class Viewer {
  constructor({ bindery }) {
    this.book = null;
    this.pageSetup = bindery.pageSetup;

    this.zoomBox = h(c('.zoom-wrap'));
    this.element = h(c('.root'), this.zoomBox);

    this.doubleSided = true;
    this.printArrange = ARRANGE_ONE;
    this.isShowingCropMarks = true;
    this.isShowingBleedMarks = false;

    this.mode = MODE_PREVIEW;
    this.element.setAttribute('bindery-view-mode', this.mode);
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    this.setGrid = this.setGrid.bind(this);
    this.setPrint = this.setPrint.bind(this);
    this.setFlip = this.setFlip.bind(this);

    this.controls = new Controls({ binder: bindery, viewer: this });

    this.element.classList.add(c('in-progress'));

    this.element.appendChild(this.controls.element);
    document.body.appendChild(this.element);
  }

  // Automatically switch into print mode
  listenForPrint() {
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener((mql) => {
        if (mql.matches) {
          // before print
          this.setPrint();
        } else {
          // after print
        }
      });
    }
    document.body.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 80) {
        e.preventDefault();
        this.setPrint();
        setTimeout(() => {
          window.print();
        }, 10);
      }
    });
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

  setInProgress() {
    this.element.classList.add(c('in-progress'));
    this.controls.setInProgress();
  }

  get isTwoUp() {
    return this.printArrange !== ARRANGE_ONE;
  }

  get isShowingCropMarks() {
    return this.element.classList.contains(c('show-crop'));
  }

  set isShowingCropMarks(newVal) {
    if (newVal) {
      this.element.classList.add(c('show-crop'));
      this.setPrint();
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
      this.setPrint();
    } else {
      this.element.classList.remove(c('show-bleed-marks'));
    }
  }

  setSheetSize(newVal) {
    this.pageSetup.setSheetSizeMode(newVal);
    this.pageSetup.updateStylesheet();

    if (this.mode !== MODE_SHEET) {
      this.setPrint();
    }
    this.updateZoom();
    setTimeout(() => { this.updateZoom(); }, 300);
  }

  setPrintArrange(newVal) {
    if (newVal === this.printArrange) return;
    this.printArrange = newVal;

    this.pageSetup.setPrintTwoUp(this.isTwoUp);
    this.pageSetup.updateStylesheet();

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
      this.error = errorView(title, text);
      this.element.appendChild(this.error);
    }
  }
  clear() {
    this.book = null;
    this.lastSpreadInProgress = null; // TODO: Make this clearer, after first render
    this.zoomBox.innerHTML = '';
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
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
    default:
      console.error(`Bindery: Unknown view mode "${newMode}"`);
      break;
    }
  }
  setGrid() {
    if (this.mode === MODE_PREVIEW) return;
    this.mode = MODE_PREVIEW;
    this.render();
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
    const { body } = document;
    if (!this.element.parentNode) {
      body.appendChild(this.element);
    }

    this.flaps = [];
    body.classList.add(c('viewing'));
    this.element.setAttribute('bindery-view-mode', this.mode);

    const scrollMax = body.scrollHeight - body.offsetHeight;
    const scrollPct = body.scrollTop / scrollMax;

    this.controls.setDone();
    window.requestAnimationFrame(() => {
      if (this.mode === MODE_PREVIEW) this.renderGrid();
      else if (this.mode === MODE_FLIP) this.renderInteractive();
      else if (this.mode === MODE_SHEET) this.renderPrint();
      else this.renderGrid();

      body.scrollTop = scrollMax * scrollPct;
      this.updateZoom();
    });
  }

  renderProgress(book) {
    this.book = book;

    this.controls.updateProgress(
      this.book.pages.length,
      this.book.estimatedProgress
    );

    const twoPageSpread = function (...arg) {
      return h(c('.spread-wrapper') + c('.spread-size'), ...arg);
    };

    this.book.pages.forEach((page, i) => {
      // If hasn't been added, or not in spread yet
      if (!this.zoomBox.contains(page.element) || page.element.parentNode === this.zoomBox) {
        if (this.lastSpreadInProgress && this.lastSpreadInProgress.children.length < 2) {
          this.lastSpreadInProgress.appendChild(page.element);
        } else {
          if (i === 0) {
            const spacer = new Page();
            spacer.element.style.visibility = 'hidden';
            this.lastSpreadInProgress = twoPageSpread(spacer.element, page.element);
          } else {
            this.lastSpreadInProgress = twoPageSpread(page.element);
          }
          this.zoomBox.appendChild(this.lastSpreadInProgress);
        }
      }
    });

    if (this.book.pageInProgress) {
      this.zoomBox.appendChild(this.book.pageInProgress.element);
    }

    this.updateZoom();
  }

  updateZoom() {
    if (this.zoomBox.firstElementChild) {
      const scrollPct = document.body.scrollTop / document.body.scrollHeight;
      const viewerRect = this.zoomBox.getBoundingClientRect();
      const contentW = this.zoomBox.firstElementChild.getBoundingClientRect().width;
      const scale = Math.min(1, viewerRect.width / (contentW));

      this.zoomBox.style.transform = `scale(${scale})`;
      document.body.scrollTop = document.body.scrollHeight * scrollPct;
    }
  }

  renderPrint() {
    this.element.classList.add(c('show-bleed'));

    this.zoomBox.innerHTML = '';

    const isBooklet = this.printArrange === ARRANGE_BOOKLET;

    let pages = this.book.pages.slice();
    if (this.printArrange === ARRANGE_SPREAD) {
      pages = padPages(pages, () => new Page());
    } else if (isBooklet) {
      pages = orderPagesBooklet(pages, () => new Page());
    }

    const fragment = printLayout(pages, this.isTwoUp, isBooklet);
    this.zoomBox.appendChild(fragment);
  }

  renderGrid() {
    this.zoomBox.innerHTML = '';

    this.element.classList.remove(c('show-bleed'));

    let pages = this.book.pages.slice();

    if (this.doubleSided) pages = padPages(pages, () => new Page());

    const fragment = gridLayout(pages, this.doubleSided);
    this.zoomBox.appendChild(fragment);
  }

  renderInteractive() {
    this.zoomBox.innerHTML = '';
    this.flaps = [];

    this.element.classList.remove(c('show-bleed'));

    const pages = padPages(this.book.pages.slice(), () => new Page());

    const fragment = flipLayout(pages, this.doubleSided);
    this.zoomBox.appendChild(fragment);
  }

}

export default Viewer;
