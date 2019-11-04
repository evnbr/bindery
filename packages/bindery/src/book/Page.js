import { Region } from 'regionize';
import { safeMeasure, createEl, classes, c } from '../dom-utils';

// TODO: renderPage needs to be called
// after any change to pageInfo that affects
// the size of the flow region. These changes
// need to be flushed before regionize tries
// to measure the element again.
const renderPage = (pageInfo) => {
  const {
    flowRegion,
    isLeft,
    isSpread,
    isSpacer,
    suppress,
    rotation,
    backgroundContent,
    footnoteElements,
    runningHeader,
  } = pageInfo;

  let backgroundEl = createEl('page-background');
  const footerEl = createEl('footer');
  if (backgroundContent) {
    backgroundEl.append(backgroundContent);
    if (rotation && rotation !== 'none') {
      const rotateContainer = createEl(`.rotate-container.page-size-rotated.rotate-${rotation}`);
      rotateContainer.append(backgroundEl);
      backgroundEl = rotateContainer;
    }
  }
  const pg = createEl('page', [
    backgroundEl,
    flowRegion.element,
    footerEl,
  ]);
  if (footnoteElements) {
    footerEl.append(...footnoteElements);
  }
  if (runningHeader) {
    pg.append(runningHeader);
  }
  pg.classList.toggle(classes.leftPage, isLeft);
  pg.classList.toggle(classes.rightPage, !isLeft);
  if (suppress) pg.classList.add(classes.isOverflowing);
  if (isSpread) pg.classList.add(c('spread'));
  if (isSpacer) pg.style.visibility = 'hidden';
  return pg;
};

class Page {
  constructor() {
    this.flowRegion = new Region(createEl('flow-box'));
    this.needsLayoutUpdate = false;
  }

  static isSizeValid() {
    const testPage = new Page();
    return safeMeasure(testPage.render(), () => testPage.flowRegion.isReasonableSize);
  }

  setLeftRight(dir) {
    this.side = dir;
    this.needsLayoutUpdate = true;
  }

  get isLeft() {
    return this.side === 'left';
  }

  get isRight() {
    return this.side === 'right';
  }

  setPreference(dir) {
    const preferLeft = dir === 'left';
    this.alwaysLeft = preferLeft;
    this.alwaysRight = !preferLeft;
  }

  get suppressErrors() {
    return this.suppress || false;
  }

  set suppressErrors(newVal) {
    this.suppress = newVal;
  }

  get isEmpty() {
    return !this.hasOutOfFlowContent && this.flowRegion.isEmpty;
  }

  validate() {
    if (!this.hasOverflowed()) return;
    const suspect = this.currentElement;
    if (suspect) {
      console.warn('Bindery: Content overflows, probably due to a style set on:', suspect);
      suspect.parentNode.removeChild(suspect);
    } else {
      console.warn('Bindery: Content overflows.');
    }
  }

  validateEnd(allowOverflow) {
    if (!this.hasOverflowed()) return;
    console.warn(`Bindery: Page ~${this.number} is overflowing`, this.element);
    if (!this.suppressErrors && !this.flowRegion.suppressErrors && !allowOverflow) {
      throw Error('Bindery: Moved to new page when last one is still overflowing');
    }
  }

  hasOverflowed() {
    return safeMeasure(this.element, () => this.flowRegion.hasOverflowed());
  }

  render() {
    const info = this;
    return renderPage(info);
  }

  get element() {
    console.warn(`Rerendering page ${this} wastefully via .element getter`);
    this.updateAndReplaceElement();
    return this.currentElement;
  }

  getLastRenderedElement() {
    return this.currentElement || this.render();
  }

  updateAndReplaceElement() {
    const oldPage = this.currentElement;
    const newPage = this.render();

    this.currentElement = newPage;
    if (oldPage && oldPage.parentNode) {
      oldPage.parentNode.replaceChild(newPage, oldPage);
    }
  }
}

export default Page;
