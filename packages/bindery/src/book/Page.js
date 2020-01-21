import { Region } from 'regionize';
import { safeMeasure, createEl } from '../dom-utils';
import renderPage from './renderPage';

class Page {
  constructor(initialState) {
    this.flowRegion = new Region(createEl('flow-box'));
    this.needsLayoutUpdate = false;
    this.currentElement = null;
    this.pageState = {};
    Object.seal(this);
    this.setState(initialState);
  }

  setState(updates) {
    const newState = {
      ...this.pageState,
      ...updates };
    newState.isLeft = newState.side === 'left';
    newState.isRight = newState.side === 'right';
    this.pageState = newState;
  }

  static isSizeValid() {
    const testPage = new Page();
    return safeMeasure(testPage.render(), () => testPage.flowRegion.isReasonableSize);
  }

  get prefersRight() {
    return this.pageState.preferredSide === 'right';
  }

  get prefersLeft() {
    return this.pageState.preferredSide === 'left';
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
    // const suspect = this.currentElement;
    // if (suspect) {
    //   console.warn('Bindery: Content overflows, probably due to a style set on:', suspect);
    //   suspect.parentNode.removeChild(suspect);
    // } else {
    //   console.warn('Bindery: Content overflows.');
    // }
  }

  validateEnd(allowOverflow) {
    if (!this.hasOverflowed()) return;
    console.warn(`Bindery: Page ~${this.number} is overflowing`, this.element);
    if (!this.suppressErrors && !this.flowRegion.suppressErrors && !allowOverflow) {
      throw Error('Bindery: Moved to new page when last one is still overflowing');
    }
  }

  hasOverflowed() {
    return safeMeasure(
      this.getElementWithAllPendingUpdates(),
      () => this.flowRegion.hasOverflowed()
    );
  }

  render() {
    const info = { ...this, ...this.pageState };
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

  getElementWithAllPendingUpdates() {
    if (this.needsLayoutUpdate) {
      this.updateAndReplaceElement();
    }
    return this.currentElement;
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
