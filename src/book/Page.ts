import { Region } from 'regionize';
import { safeMeasure, div, classes } from '../dom';
import { HierarchyEntry } from '../types';

class HierarchyToHeadingAdapter {
  getHierarchy: () => HierarchyEntry[];

  constructor(getter: () => HierarchyEntry[]) {
    // console.warn('Deprecated');
    this.getHierarchy = getter;
  }

  textFor(sel: string): string | undefined {
    return this.getHierarchy()?.find(entry => entry?.selector === sel)?.text;
  }

  get h1() {
    return this.textFor('h1');
  }
  get h2() {
    return this.textFor('h2');
  }
  get h3() {
    return this.textFor('h3');
  }
  get h4() {
    return this.textFor('h4');
  }
  get h5() {
    return this.textFor('h5');
  }
  get h6() {
    return this.textFor('h6');
  }
}

class Page {
  flow: Region;
  footer: HTMLElement;
  background: HTMLElement;
  element: HTMLElement;
  runningHeader?: HTMLElement; // used by running header. TODO: only supports one

  side?: string;
  number?: number;
  heading: HierarchyToHeadingAdapter; // used by running headers
  hierarchy: HierarchyEntry[] = [];

  suppress = false;
  hasOutOfFlowContent = false;
  alwaysLeft = false;
  alwaysRight = false;

  isOutOfFlow = false; // used by spreads
  avoidReorder = false; // used by 2-page spreads

  constructor() {
    this.flow = new Region(div('flow-box'));
    this.footer = div('footer');
    this.background = div('page-background');
    this.element = div('page', this.background, this.flow.element, this.footer);

    this.heading = new HierarchyToHeadingAdapter(() => this.hierarchy);
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
    return this.suppress ?? false;
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
      console.warn(
        'Bindery: Content overflows, probably due to a style set on:',
        suspect,
      );
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
      throw Error(
        'Bindery: Moved to new page when last one is still overflowing',
      );
    }
  }

  hasOverflowed() {
    return safeMeasure(this.element, () => this.flow.hasOverflowed());
  }
}

export default Page;
