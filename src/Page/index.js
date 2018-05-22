import FlowBox from '../flow-box';
import { c, createEl } from '../dom';

class Page {
  constructor() {
    this.flow = new FlowBox();
    this.footer = createEl('footer');
    this.background = createEl('page-background');
    this.element = createEl('page', [this.background, this.flow.element, this.footer]);
  }

  static isSizeValid() {
    const testPage = new Page();
    let measureArea = document.querySelector(c('.measure-area'));
    if (!measureArea) measureArea = document.body.appendChild(createEl('measure-area'));

    measureArea.innerHTML = '';
    measureArea.appendChild(testPage.element);
    const isValid = testPage.flow.isReasonable;
    measureArea.parentNode.removeChild(measureArea);

    return isValid;
  }

  setLeftRight(dir) {
    if (dir === 'left') {
      this.side = dir;
      this.element.classList.remove(c('right'));
      this.element.classList.add(c('left'));
    } else if (dir === 'right') {
      this.side = dir;
      this.element.classList.remove(c('left'));
      this.element.classList.add(c('right'));
    } else {
      throw Error(`Bindery: Setting page to invalid direction${dir}`);
    }
  }

  get suppressErrors() {
    return this.suppress || false;
  }

  set suppressErrors(newVal) {
    this.suppress = newVal;
    if (newVal) {
      this.element.classList.add(c('is-overflowing'));
    } else {
      this.element.classList.remove(c('is-overflowing'));
    }
  }

  get isEmpty() {
    return (
      !this.hasOutOfFlowContent && this.flow.isEmpty
    );
  }

  get isLeft() {
    return this.side === 'left';
  }

  get isRight() {
    return this.side === 'right';
  }

  setPreference(dir) {
    if (dir === 'left') this.alwaysLeft = true;
    if (dir === 'right') this.alwaysRight = true;
  }

  validate() {
    if (this.hasOverflowed()) {
      const suspect = this.currentElement;
      if (suspect) {
        console.warn('Bindery: Content overflows, probably due to a style set on:', suspect);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.warn('Bindery: Content overflows.');
      }
    }
  }

  validateEnd(allowOverflow) {
    if (this.hasOverflowed()) {
      console.warn(`Bindery: Page ~${this.number} is overflowing`, this.element);
      if (!this.suppressErrors && !allowOverflow) {
        throw Error('Bindery: Moved to new page when last one is still overflowing');
      }
    }
  }

  hasOverflowed() {
    return this.flow.hasOverflowed();
  }
}

export default Page;
