import { Page, Book } from '../book';
import Controls from '../controls';
import { ViewerMode, SheetMarks, SheetSize, SheetLayout } from '../constants';
import { classes, allModeClasses, classForMode, div } from '../dom';
import { throttleFrame, throttleTime } from '../utils';
import { renderGridViewer } from './gridViewer';
import { renderSheetViewer } from './sheetViewer';
import { renderFlipbookViewer } from './flipbookViewer';
import {
  scrollToBottom,
  scrollToPercent,
  getScrollAsPercent,
} from './scrollUtils';

import errorView from './error';
import listenForPrint from './listenForPrint';
import PageSetup from '../page-setup';

const throttleProgressBar = throttleFrame();
const throttleRender = throttleTime(100);
const throttleResize = throttleTime(50);

const pageSpread = (...pgs: HTMLElement[]) => {
  return div('.spread-wrapper.spread-centered.spread-size', ...pgs);
};

interface ViewerOptions {
  pageSetup: PageSetup;
  mode: ViewerMode;
  layout: SheetLayout;
  marks: SheetMarks;
}

interface ViewerResult {
  element: DocumentFragment;
  next?: () => void;
  previous?: () => void;
}

type ViewerFactory = (pages: Page[], isDoubleSided: boolean, sheetLayout: SheetLayout) => ViewerResult;

class Viewer {
  book?: Book;
  pageSetup: PageSetup;
  currentResult?: ViewerResult;

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

    this.controls = new Controls();
    this.updateControls();

    this.progressBar = div('.progress-bar');
    this.content = div('.zoom-content');
    this.scaler = div('.zoom-scaler', this.content);
    this.element = div(
      '.root',
      this.progressBar,
      this.controls.element,
      this.scaler,
    );

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

    document.body.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          const prev = this.currentResult?.previous;
          if (prev) prev();
          break;
        case 'ArrowRight':
          const next = this.currentResult?.next;
          if (next) next();
          break;
        default:
            break;
      }  
    });

    window.addEventListener('resize', () => {
      throttleResize(() => this.scaleToFit());
    });

    this.setInProgress(true);
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

  setInProgress(newVal: boolean) {
    this.element.classList.toggle(classes.inProgress, newVal);
  }

  get isTwoUp() {
    return this.sheetLayout !== SheetLayout.PAGES;
  }

  setShowingCropMarks(newVal: boolean) {
    this.element.classList.toggle(classes.showCrop, newVal);
  }

  setShowingBleedMarks(newVal: boolean) {
    this.element.classList.toggle(classes.showBleedMarks, newVal);
  }

  setShowingBleed(newVal: boolean) {
    this.element.classList.toggle(classes.showBleed, newVal);
  }

  get isViewing() {
    return window.document.body.classList.contains(classes.isViewing);
  }

  set isViewing(newVal) {
    window.document.body.classList.toggle(classes.isViewing, newVal);
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

    this.setShowingCropMarks(
      newVal === SheetMarks.CROP || newVal === SheetMarks.BOTH,
    );
    this.setShowingBleedMarks(
      newVal === SheetMarks.BLEED || newVal === SheetMarks.BOTH,
    );
  }

  displayError(title: string, text: string) {
    this.show();
    if (!this.error) {
      this.error = errorView(title, text);
      this.element.appendChild(this.error);
      scrollToBottom();
      if (this.book) {
        const flow = this.book.currentPage.flow;
        if (flow) flow.currentElement.style.outline = '3px solid red';
      }
    }
  }

  clear() {
    this.book = undefined;
    this.lastSpreadInProgress = undefined; // TODO: Make this clearer, after first render
    this.content.innerHTML = '';
  }

  show() {
    if (this.element.parentNode) return;
    window.document.body.appendChild(this.element);
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
    this.setShowingBleed(this.mode === ViewerMode.PRINT);

    const prevScroll = getScrollAsPercent();

    this.setProgressAmount(1);

    window.requestAnimationFrame(() => {
      if (!this.book) throw Error('Book missing');
      const pages = this.book.pages.slice();
      const result = this.factoryFor(this.mode)(pages, this.isDoubleSided, this.sheetLayout);
      this.currentResult = result;
      this.content.innerHTML = '';
      this.content.append(result.element);
      
      if (!this.hasRendered) this.hasRendered = true;
      else scrollToPercent(prevScroll);

      this.scaleToFit();
    });
  }

  factoryFor(mode: ViewerMode): ViewerFactory {
    if (mode === ViewerMode.PREVIEW) return renderGridViewer;
    else if (mode === ViewerMode.FLIPBOOK) return renderFlipbookViewer;
    else if (mode === ViewerMode.PRINT) return renderSheetViewer;
    throw Error(`Invalid layout mode: ${this.mode} (type ${typeof this.mode})`);
  }

  setProgressAmount(newVal: number) {
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
    this.setProgressAmount(estimatedProgress);

    if (!window.document.scrollingElement) return;

    const scroller = window.document.scrollingElement as HTMLElement;
    // don't bother rerendering if preview is out of view
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
    const prevScroll = getScrollAsPercent();
    this.scaler.style.transform = `scale(${this.scaleThatFits})`;
    scrollToPercent(prevScroll);
  }

  get scaleThatFits() {
    const viewerW = this.scaler.getBoundingClientRect().width;
    const contentW = this.content.getBoundingClientRect().width;
    return Math.min(1, viewerW / contentW);
  }
}

export default Viewer;
