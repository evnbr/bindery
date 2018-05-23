import { Page, orderPagesBooklet } from '../book';
import { Mode, Paper, Layout, Marks } from '../main/Constants';
import { createEl } from '../dom-utils';
import { oncePerFrameLimiter } from '../utils';
import classes from '../classes';

import errorView from './error';
import padPages from './padPages';
import { gridLayout, printLayout, flipLayout } from './Layouts';
import listenForPrint from './listenForPrint';

const modeClasses = {};
modeClasses[Mode.PREVIEW] = classes.viewPreview;
modeClasses[Mode.PRINT] = classes.viewPrint;
modeClasses[Mode.FLIPBOOK] = classes.viewFlip;

const throttleProgress = oncePerFrameLimiter();

class Viewer {
  constructor({ pageSetup, mode, layout, marks, ControlsComponent }) {
    this.book = null;
    this.pageSetup = pageSetup;

    this.progressBar = createEl('progress-bar');
    this.content = createEl('zoom-content');
    this.scaler = createEl('zoom-scaler', [this.content]);
    this.element = createEl('root', [this.progressBar, this.scaler]);

    this.doubleSided = true;
    this.printArrange = layout;

    this.setMarks(marks);
    this.mode = mode;
    this.element.classList.add(classes.viewPreview);
    this.currentLeaf = 0;

    listenForPrint(() => this.setPrint());

    const throttleResize = oncePerFrameLimiter();
    window.addEventListener('resize', () => {
      throttleResize(() => this.updateZoom());
    });

    this.setPrint = this.setPrint.bind(this);

    if (ControlsComponent) {
      this.controls = new ControlsComponent(
        { Mode, Paper, Layout, Marks }, // Available options
        { // Initial props
          paper: this.pageSetup.paper,
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

    this.inProgress = true;

    document.body.appendChild(this.element);
  }

  get inProgress() {
    return this.element.classList.contains(classes.inProgress);
  }
  set inProgress(newVal) {
    this.element.classList.toggle(classes.inProgress, newVal);
    if (newVal && this.controls) this.controls.setInProgress();
  }

  get isTwoUp() {
    return this.printArrange !== Layout.PAGES;
  }

  get isShowingCropMarks() {
    return this.element.classList.contains(classes.showCrop);
  }
  set isShowingCropMarks(newVal) {
    this.element.classList.toggle(classes.showCrop, newVal);
  }

  get isShowingBleedMarks() {
    return this.element.classList.contains(classes.showBleedMarks);
  }
  set isShowingBleedMarks(newVal) {
    this.element.classList.toggle(classes.showBleedMarks, newVal);
  }

  get isShowingBleed() {
    return this.element.classList.contains(classes.showBleed);
  }
  set isShowingBleed(newVal) {
    this.element.classList.toggle(classes.showBleed, newVal);
  }

  set isViewing(newVal) {
    document.body.classList.toggle(classes.isViewing, newVal);
  }

  setSheetSize(newVal) {
    this.pageSetup.paper = newVal;
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
    this.isShowingCropMarks = (newVal === Marks.CROP || newVal === Marks.BOTH);
    this.isShowingBleedMarks = (newVal === Marks.BLEED || newVal === Marks.BOTH);
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
    this.content.innerHTML = '';
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
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

    this.isViewing = true;
    this.element.classList.remove(...Object.keys(modeClasses).map(k => modeClasses[k]));
    this.element.classList.add(modeClasses[this.mode]);

    const scrollMax = body.scrollHeight - body.offsetHeight;
    const scrollPct = body.scrollTop / scrollMax;

    if (this.controls) this.controls.setDone(this.book.pages.length);
    this.progressBar.style.transform = '';

    window.requestAnimationFrame(() => {
      const pages = this.book.pages.slice();

      let frag;
      if (this.mode === Mode.FLIPBOOK) frag = this.renderInteractive(pages);
      else if (this.mode === Mode.PRINT) frag = this.renderPrint(pages);
      else frag = this.renderGrid(pages);

      this.content.innerHTML = '';
      this.content.appendChild(frag);
      body.scrollTop = scrollMax * scrollPct;
      this.updateZoom();
    });
  }

  set progress(p) {
    throttleProgress(() => {
      this.progressBar.style.transform = `scaleX(${p})`;
    });
  }

  renderProgress(book, estimatedProgress) {
    this.book = book;
    const needsZoomUpdate = !this.content.firstElementChild;

    this.progress = estimatedProgress;

    if (this.controls) {
      this.controls.updateProgress(book.pageCount, estimatedProgress);
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
      if (!this.content.contains(page.element) || page.element.parentNode === this.content) {
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
          this.content.appendChild(this.lastSpreadInProgress);
        }
      }
    });

    if (this.book.currentPage) {
      this.content.appendChild(this.book.currentPage.element);
    }

    if (needsZoomUpdate) this.updateZoom();
  }

  updateZoom() {
    if (!this.content.firstElementChild) return;

    const scrollPct = document.body.scrollTop / document.body.scrollHeight;
    const viewerRect = this.scaler.getBoundingClientRect();
    const contentW = this.content.getBoundingClientRect().width;
    const scale = Math.min(1, viewerRect.width / (contentW));

    this.scaler.style.transform = `scale(${scale})`;
    document.body.scrollTop = document.body.scrollHeight * scrollPct;
  }

  renderPrint(bookPages) {
    let pages = bookPages;
    this.isShowingBleed = true;
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
    this.isShowingBleed = false;
    if (this.doubleSided) pages = padPages(pages, () => new Page());
    return gridLayout(pages, this.doubleSided);
  }

  renderInteractive(bookPages) {
    this.isShowingBleed = false;
    const pages = padPages(bookPages, () => new Page());
    return flipLayout(pages, this.doubleSided);
  }
}

export default Viewer;
