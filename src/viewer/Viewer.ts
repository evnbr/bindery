import { Page, Book } from '../book';
import Controls from '../controls';
import { ViewerMode, SheetMarks, SheetSize, SheetLayout } from '../constants';
import { classes, allModeClasses, classForMode, div } from '../dom';
import { throttleFrame, throttleTime } from '../utils';
import { renderGridViewer } from './gridViewer';
import { renderSheetViewer } from './sheetViewer';
import { renderFlipbookViewer } from './flipbookViewer';

import errorView from './error';
import listenForPrint from './listenForPrint';
import PageSetup from '../page-setup';

const throttleProgressBar = throttleFrame();
const throttleRender = throttleTime(100);
const throttleResize = throttleTime(50);
const document = window.document;

const pageSpread = (...pgs: HTMLElement[]) => {
  return div('.spread-wrapper.spread-centered.spread-size', ...pgs);
};

interface ViewerOptions {
  pageSetup: PageSetup;
  mode: ViewerMode;
  layout: SheetLayout;
  marks: SheetMarks;
}

class Viewer {
  book?: Book;
  pageSetup: PageSetup;

  progressBar: HTMLElement;
  content: HTMLElement;
  scaler: HTMLElement;
  element: HTMLElement;
  error?: HTMLElement;

  isDoubleSided: boolean;
  sheetLayout: SheetLayout;
  marks: SheetMarks;
  mode: ViewerMode;
  currentLeaf: number;
  controls: Controls;
  lastSpreadInProgress: any;
  hasRendered: boolean = false;

  constructor({ pageSetup, mode, layout, marks }: ViewerOptions) {
    this.pageSetup = pageSetup;

    this.progressBar = div('.progress-bar');
    this.content = div('.zoom-content');
    this.scaler = div('.zoom-scaler', this.content);
    this.element = div('.root', this.progressBar, this.scaler);

    this.isDoubleSided = true;
    this.sheetLayout = layout;

    this.marks = marks;
    this.mode = mode;
    this.element.classList.add(classes.viewPreview);
    this.currentLeaf = 0;

    listenForPrint(() => {
      this.mode = ViewerMode.PRINT;
      this.render();
    });

    window.addEventListener('resize', () => {
      throttleResize(() => this.scaleToFit());
    });

    this.controls = new Controls();
    this.updateControls();
    this.element.appendChild(this.controls.element);

    this.isInProgress = true;

    this.setMarks(marks);
    this.show();
  }

  updateControls() {
    this.controls.update(
      {
        // Initial props
        paper: this.pageSetup.paper,
        layout: this.sheetLayout,
        mode: this.mode,
        marks: this.marks,
        pageSize: this.pageSetup.displaySize,
      },
      {
        // Actions
        setMode: this.setMode.bind(this),
        setPaper: this.setSheetSize.bind(this),
        setLayout: this.setLayout.bind(this),
        setMarks: this.setMarks.bind(this),
      },
    );
  }

  setMode(newMode: ViewerMode) {
    if (newMode === this.mode) return;
    this.mode = newMode;
    this.updateControls();
    this.render();
  }

  get isInProgress() {
    return this.element.classList.contains(classes.inProgress);
  }

  set isInProgress(newVal) {
    this.element.classList.toggle(classes.inProgress, newVal);
  }

  get isTwoUp() {
    return this.sheetLayout !== SheetLayout.PAGES;
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

  get isViewing() {
    return document.body.classList.contains(classes.isViewing);
  }

  set isViewing(newVal) {
    document.body.classList.toggle(classes.isViewing, newVal);
  }

  setSheetSize(newVal: SheetSize) {
    this.pageSetup.paper = newVal;
    this.pageSetup.updateStyleVars();

    this.mode = ViewerMode.PRINT;
    this.render();

    this.scaleToFit();
    setTimeout(() => {
      this.scaleToFit();
    }, 300);
  }

  setLayout(newVal: SheetLayout) {
    if (newVal === this.sheetLayout) return;
    this.sheetLayout = newVal;

    this.pageSetup.printTwoUp = this.isTwoUp;
    this.pageSetup.updateStyleVars();

    this.mode = ViewerMode.PRINT;
    this.render();
  }

  setMarks(newVal: SheetMarks) {
    this.marks = newVal;
    this.updateControls();

    this.isShowingCropMarks =
      newVal === SheetMarks.CROP || newVal === SheetMarks.BOTH;
    this.isShowingBleedMarks =
      newVal === SheetMarks.BLEED || newVal === SheetMarks.BOTH;
  }

  displayError(title: string, text: string) {
    this.show();
    if (!this.error) {
      this.error = errorView(title, text);
      this.element.appendChild(this.error);
      this.scrollToBottom();
      if (this.book) {
        const flow = this.book.currentPage.flow;
        if (flow) flow.currentElement.style.outline = '3px solid red';
      }
    }
  }

  scrollToBottom() {
    const scroll = document.scrollingElement as HTMLElement;
    if (!scroll) return;
    const scrollMax = scroll.scrollHeight - scroll.offsetHeight;
    scroll.scrollTop = scrollMax;
  }

  clear() {
    this.book = undefined;
    this.lastSpreadInProgress = undefined; // TODO: Make this clearer, after first render
    this.content.innerHTML = '';
  }

  show() {
    if (this.element.parentNode) return;
    document.body.appendChild(this.element);
    this.isViewing = true;
  }

  hide() {
    // TODO this doesn't work if the target is an existing node
    this.element.parentNode?.removeChild(this.element);
    this.isViewing = false;
  }

  render(newBook?: Book) {
    if (newBook) this.book = newBook;
    if (!this.book) return;
    this.show();
    this.updateControls();

    this.element.classList.remove(...allModeClasses);
    this.element.classList.add(classForMode(this.mode));
    this.isShowingBleed = this.mode === ViewerMode.PRINT;

    const prevScroll = this.scrollPercent;

    this.progress = 1;

    window.requestAnimationFrame(() => {
      if (!this.book) throw Error('Book missing');
      const pages = this.book.pages.slice();
      const render = this.renderFunctionFor(this.mode);
      const fragment = render(pages, this.isDoubleSided, this.sheetLayout);
      this.content.innerHTML = '';
      this.content.appendChild(fragment);
      if (!this.hasRendered) this.hasRendered = true;
      else this.scrollPercent = prevScroll;

      this.scaleToFit();
    });
  }

  renderFunctionFor(mode: ViewerMode) {
    if (mode === ViewerMode.PREVIEW) return renderGridViewer;
    else if (mode === ViewerMode.FLIPBOOK) return renderFlipbookViewer;
    else if (mode === ViewerMode.PRINT) return renderSheetViewer;
    throw Error(`Invalid layout mode: ${this.mode} (type ${typeof this.mode})`);
  }

  set progress(newVal: number) {
    if (newVal < 1) {
      throttleProgressBar(() => {
        this.progressBar.style.transform = `scaleX(${newVal})`;
      });
    } else {
      this.progressBar.style.transform = '';
    }
  }

  updateProgress(book: Book, estimatedProgress: number) {
    this.book = book;
    this.progress = estimatedProgress;

    if (!document.scrollingElement) return;

    const scroller = document.scrollingElement as HTMLElement;
    // don't rerender if preview is out of view
    const scrollTop = scroller.scrollTop;
    const scrollH = scroller.scrollHeight;
    const h = scroller.offsetHeight;
    if (scrollH > h * 3 && scrollTop < h) return;

    // don't rerender too often
    throttleRender(() => this.renderProgress(book, estimatedProgress));
  }

  renderProgress(book: Book, estimatedProgress: number) {
    const needsZoomUpdate = !this.content.firstElementChild;

    const sideBySide =
      this.mode === ViewerMode.PREVIEW ||
      (this.mode === ViewerMode.PRINT &&
        this.sheetLayout !== SheetLayout.PAGES);
    const limit = sideBySide ? 2 : 1;

    book.pages.forEach((page: Page, i: number) => {
      if (
        this.content.contains(page.element) &&
        page.element.parentNode !== this.content
      )
        return;
      if (
        this.lastSpreadInProgress &&
        this.lastSpreadInProgress.children.length < limit
      ) {
        this.lastSpreadInProgress.append(page.element);
        return;
      }
      this.lastSpreadInProgress = pageSpread(page.element);
      if (i === 0 && sideBySide) {
        const spacer = new Page();
        spacer.element.style.visibility = 'hidden';
        this.lastSpreadInProgress.insertBefore(
          spacer.element,
          this.lastSpreadInProgress.firstElementChild,
        );
      }
      this.content.append(this.lastSpreadInProgress);
    });

    if (needsZoomUpdate) this.scaleToFit();
  }

  scaleToFit() {
    if (!this.content.firstElementChild) return;
    const prevScroll = this.scrollPercent;
    this.scaler.style.transform = `scale(${this.scaleThatFits})`;
    this.scrollPercent = prevScroll;
  }

  get scaleThatFits() {
    const viewerW = this.scaler.getBoundingClientRect().width;
    const contentW = this.content.getBoundingClientRect().width;
    return Math.min(1, viewerW / contentW);
  }

  get scrollPercent() {
    if (!document || !document.scrollingElement) return 0;
    const el = document.scrollingElement;
    return el.scrollTop / el.scrollHeight;
  }

  set scrollPercent(newVal) {
    if (!document.scrollingElement) return;
    const el = document.scrollingElement;
    el.scrollTop = el.scrollHeight * newVal;
  }
}

export default Viewer;
