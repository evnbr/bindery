import { Region } from 'regionize';
import { safeMeasure, createEl, classes } from '../dom-utils';

class Page {
  flow: Region;
  footer: HTMLElement;
  background: HTMLElement;
  element: HTMLElement;
  runningHeader?: HTMLElement; // used by running header. TODO: only supports one

  side?: string;
  number?: number;
  heading: { [key: string]: any } = {}; // used by running headers

  suppress = false;
  hasOutOfFlowContent = false;
  alwaysLeft = false;
  alwaysRight = false;

  isOutOfFlow = false; // used by spreads
  avoidReorder = false; // used by 2-page spreads

  constructor() {
    this.flow = new Region(createEl('flow-box'));
    this.footer = createEl('footer');
    this.background = createEl('page-background');
    this.element = createEl('page', [this.background, this.flow.element, this.footer]);
  }

  static isSizeValid() {
    const testPage = new Page();
    return safeMeasure(testPage.element, () => testPage.flow.isReasonableSize);
  }

  setLeftRight(dir: string) {
    this.side = dir;
    this.element.classList.toggle(classes.leftPage, this.isLeft);
    this.element.classList.toggle(classes.rightPage, !this.isLeft);
  }
  get isLeft() {
    return this.side === 'left';
  }

  get isRight() {
    return this.side === 'right';
  }

  setPreference(dir: 'left' | 'right') {
    const preferLeft = dir === 'left';
    this.alwaysLeft = preferLeft;
    this.alwaysRight = !preferLeft;
  }

  get suppressErrors() {
    return this.suppress || false;
  }

  set suppressErrors(newVal) {
    this.suppress = newVal;
    this.element.classList.toggle(classes.isOverflowing, newVal);
  }

  get isEmpty() {
    return !this.hasOutOfFlowContent && this.flow.isEmpty;
  }

  validate() {
    if (!this.hasOverflowed()) return;
    const suspect = this.flow.currentElement;
    if (suspect) {
      console.warn('Bindery: Content overflows, probably due to a style set on:', suspect);
      if (suspect.parentNode) {
        suspect.parentNode.removeChild(suspect);
      }
    } else {
      console.warn('Bindery: Content overflows.');
    }
  }

  validateEnd(allowOverflow: boolean) {
    if (!this.hasOverflowed()) return;
    console.warn(`Bindery: Page ~${this.number} is overflowing`, this.element);
    if (!this.suppressErrors && !this.flow.suppressErrors && !allowOverflow) {
      throw Error('Bindery: Moved to new page when last one is still overflowing');
    }
  }

  hasOverflowed() {
    return safeMeasure(this.element, () => this.flow.hasOverflowed());
  }
}

export default Page;
