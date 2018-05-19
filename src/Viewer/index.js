import { c, createEl } from '../utils';
import Page from '../Page';

import errorView from './error';
import orderPagesBooklet from './orderPagesBooklet';
import padPages from './padPages';
import { gridLayout, printLayout, flipLayout } from './Layouts';

import { Mode, Paper, Layout, Marks } from '../Constants';

const modeAttr = {};
modeAttr[Mode.PREVIEW] = 'preview';
modeAttr[Mode.PRINT] = 'print';
modeAttr[Mode.FLIPBOOK] = 'flip';

const isCommandP = e => (e.ctrlKey || e.metaKey) && e.keyCode === 80;

class Viewer {
  constructor({ pageSetup, mode, layout, marks, ControlsComponent }) {
    this.book = null;
    this.pageSetup = pageSetup;

    this.progressBar = createEl('.progress-bar');
    this.zoomBox = createEl('zoom-wrap');
    this.element = createEl('root', [this.progressBar, this.zoomBox]);

    this.doubleSided = true;
    this.printArrange = layout;

    this.setMarks(marks);
    this.mode = mode;
    this.element.setAttribute('bindery-view-mode', modeAttr[this.mode]);
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    this.setPrint = this.setPrint.bind(this);

    if (ControlsComponent) {
      this.controls = new ControlsComponent(
        { Mode, Paper, Layout, Marks }, // Available options
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
      this.element.appendChild(this.controls.element);
    }

    this.element.classList.add(c('in-progress'));

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
      if (isCommandP(e)) {
        e.preventDefault();
        this.setPrint();
        setTimeout(() => window.print(), 50);
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
    if (this.controls) this.controls.setInProgress();
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
    this.pageSetup.updateStyleVars();

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
    this.pageSetup.updateStyleVars();

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
  render(newBook) {
    if (newBook) this.book = newBook;
    if (!this.book) return;
    const { body } = document;
    if (!this.element.parentNode) {
      body.appendChild(this.element);
    }

    body.classList.add(c('viewing'));
    this.element.setAttribute('bindery-view-mode', modeAttr[this.mode]);

    const scrollMax = body.scrollHeight - body.offsetHeight;
    const scrollPct = body.scrollTop / scrollMax;

    if (this.controls) this.controls.setDone(this.book.pages.length);
    this.progressBar.style.width = '100%';

    window.requestAnimationFrame(() => {
      const pages = this.book.pages.slice();

      let frag;
      if (this.mode === Mode.FLIPBOOK) frag = this.renderInteractive(pages);
      else if (this.mode === Mode.PRINT) frag = this.renderPrint(pages);
      else frag = this.renderGrid(pages);

      this.zoomBox.innerHTML = '';
      this.zoomBox.appendChild(frag);
      body.scrollTop = scrollMax * scrollPct;
      this.updateZoom();
    });
  }

  renderProgress(book) {
    this.book = book;

    this.progressBar.style.width = `${book.estimatedProgress * 100}%`;

    if (this.controls) {
      this.controls.updateProgress(book.pageCount, book.estimatedProgress);
    }

    const sideBySide =
      this.mode === Mode.PREVIEW
      || (this.mode === Mode.PRINT && this.printArrange !== Layout.PAGES);
    const limit = sideBySide ? 2 : 1;

    const makeSpread = function (...arg) {
      return createEl('.spread-wrapper.spread-size', [...arg]);
    };

    this.book.pages.forEach((page, i) => {
      // If hasn't been added, or not in spread yet
      if (!this.zoomBox.contains(page.element) || page.element.parentNode === this.zoomBox) {
        if (this.lastSpreadInProgress && this.lastSpreadInProgress.children.length < limit) {
          this.lastSpreadInProgress.appendChild(page.element);
        } else {
          if (i === 0 && sideBySide) {
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

    if (this.book.currentPage) {
      this.zoomBox.appendChild(this.book.currentPage.element);
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

  renderPrint(bookPages) {
    let pages = bookPages;
    this.element.classList.add(c('show-bleed'));
    const isBooklet = this.printArrange === Layout.BOOKLET;
    if (this.printArrange === Layout.SPREADS) {
      pages = padPages(pages, () => new Page());
    } else if (isBooklet) {
      pages = orderPagesBooklet(pages, () => new Page());
    }
    return printLayout(pages, this.isTwoUp, isBooklet);
  }

  renderGrid(bookPages) {
    let pages = bookPages;
    this.element.classList.remove(c('show-bleed'));
    if (this.doubleSided) pages = padPages(pages, () => new Page());
    return gridLayout(pages, this.doubleSided);
  }

  renderInteractive(bookPages) {
    this.element.classList.remove(c('show-bleed'));
    const pages = padPages(bookPages, () => new Page());
    return flipLayout(pages, this.doubleSided);
  }

}

export default Viewer;
