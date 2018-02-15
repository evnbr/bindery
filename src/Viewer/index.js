import h from 'hyperscript';
import { c } from '../utils';

import Controls from './Controls';
import Page from '../Page';

import errorView from './error';
import orderPagesBooklet from './orderPagesBooklet';
import padPages from './padPages';
import { gridLayout, printLayout, flipLayout } from './Layouts';

import { Mode, Layout, Marks } from '../Constants';

const modeAttr = {};
modeAttr[Mode.PREVIEW] = 'preview';
modeAttr[Mode.PRINT] = 'print';
modeAttr[Mode.FLIPBOOK] = 'flip';

class Viewer {
  constructor({ bindery, mode, layout, marks }) {
    this.book = null;
    this.pageSetup = bindery.pageSetup;

    this.zoomBox = h(c('.zoom-wrap'));
    this.element = h(c('.root'), this.zoomBox);

    this.doubleSided = true;
    this.printArrange = layout;

    this.setMarks(marks);
    this.mode = mode;
    this.element.setAttribute('bindery-view-mode', modeAttr[this.mode]);
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    this.setPrint = this.setPrint.bind(this);

    this.controls = new Controls(
      { // Initial props
        paper: this.pageSetup.sheetSizeMode,
        layout: this.printArrange,
        mode: this.mode,
        marks,
      },
      { // Actions
        setMode: (newMode) => {
          if (newMode === this.mode) return;
          this.mode = newMode;
          this.render();
        },
        setPaper: this.setSheetSize.bind(this),
        setLayout: this.setPrintArrange.bind(this),
        setMarks: this.setMarks.bind(this),
        getPageSize: () => this.pageSetup.displaySize,
      }
    );

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
    return this.printArrange !== Layout.PAGES;
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
    this.pageSetup.sheetSizeMode = newVal;
    this.pageSetup.updateStylesheet();

    if (this.mode !== Mode.PRINT) {
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

    if (this.mode === Mode.PRINT) {
      this.render();
    } else {
      this.setPrint();
    }
  }

  setMarks(newVal) {
    switch (newVal) {
    case Marks.NONE:
      this.isShowingCropMarks = false;
      this.isShowingBleedMarks = false;
      break;
    case Marks.CROP:
      this.isShowingCropMarks = true;
      this.isShowingBleedMarks = false;
      break;
    case Marks.BLEED:
      this.isShowingCropMarks = false;
      this.isShowingBleedMarks = true;
      break;
    case Marks.BOTH:
      this.isShowingCropMarks = true;
      this.isShowingBleedMarks = true;
      break;
    default:
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
  setPrint() {
    if (this.mode === Mode.PRINT) return;
    this.mode = Mode.PRINT;
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
    this.element.setAttribute('bindery-view-mode', modeAttr[this.mode]);

    const scrollMax = body.scrollHeight - body.offsetHeight;
    const scrollPct = body.scrollTop / scrollMax;

    this.controls.setDone(this.book.pages.length);
    window.requestAnimationFrame(() => {
      if (this.mode === Mode.PREVIEW) this.renderGrid();
      else if (this.mode === Mode.FLIPBOOK) this.renderInteractive();
      else if (this.mode === Mode.PRINT) this.renderPrint();
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

    const shouldPreviewSpreads =
      this.mode === Mode.PREVIEW
      || (this.mode === Mode.PRINT && this.printArrange !== Layout.PAGES);
    const limit = shouldPreviewSpreads ? 2 : 1;

    const makeSpread = function (...arg) {
      return h(c('.spread-wrapper') + c(shouldPreviewSpreads ? '.spread-size' : '.page-size'), ...arg);
    };

    this.book.pages.forEach((page, i) => {
      // If hasn't been added, or not in spread yet
      if (!this.zoomBox.contains(page.element) || page.element.parentNode === this.zoomBox) {
        if (this.lastSpreadInProgress && this.lastSpreadInProgress.children.length < limit) {
          this.lastSpreadInProgress.appendChild(page.element);
        } else {
          if (i === 0 && shouldPreviewSpreads) {
            const spacer = new Page();
            spacer.element.style.visibility = 'hidden';
            this.lastSpreadInProgress = makeSpread(spacer.element, page.element);
          } else {
            this.lastSpreadInProgress = makeSpread(page.element);
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

    const isBooklet = this.printArrange === Layout.BOOKLET;

    let pages = this.book.pages.slice();
    if (this.printArrange === Layout.SPREADS) {
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
