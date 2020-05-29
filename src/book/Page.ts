import { Region } from 'regionize';
import { safeMeasure, div, classes } from '../dom';
import { HierarchyToHeadingAdapter } from './HierarchyToHeadingAdapter';
import { PageModel } from './PageModel';

const createInitialPageModel = (): PageModel => {
  return {
    heading: new HierarchyToHeadingAdapter(), // used by running headers
    isOutOfFlow: false,
    avoidReorder: false,
    footnotes: [],
    hierarchy: [],
    isLeft: false,
    hasOutOfFlowContent: false,
    suppressOverflowError: false,
  };
};

class Page {
  flow: Region;
  footer: HTMLElement;
  private background: HTMLElement;
  private element: HTMLElement;
  private runningHeader?: HTMLElement; // used by running header. TODO: only supports one

  private _needsUpdate = true;
  suppress = false;

  private _state: PageModel = createInitialPageModel();

  constructor() {
    this.flow = new Region(div('flow-box'));
    this.footer = div('footer');
    this.background = div('page-background');
    this.element = div('page', this.background, this.flow.element, this.footer);
  }

  setState(updates: Partial<PageModel>) {
    const newState: PageModel = {
      ...this.state,
      ...updates,
    };
    newState.isLeft = newState.side === 'left';
    newState.heading.hierarchy = newState.hierarchy;
    this._state = newState;

    this._needsUpdate = true;
  }

  private performUpdate() {
    this.element.classList.toggle(classes.leftPage, this.state.isLeft);
    this.element.classList.toggle(classes.rightPage, !this.state.isLeft);
    this.element.classList.toggle(
      classes.isOverflowing,
      this.state.suppressOverflowError,
    );

    this._needsUpdate = false;
  }

  get state(): Readonly<PageModel> {
    return this._state;
  }

  static isSizeValid() {
    const testPage = new Page();
    return safeMeasure(testPage.element, () => testPage.flow.isReasonableSize);
  }

  get isEmpty() {
    return !this.state.hasOutOfFlowContent && this.flow.isEmpty();
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
    console.warn(
      `Bindery: Page ~${this.state.number} is overflowing`,
      this.element,
    );
    if (
      !this.state.suppressOverflowError &&
      !this.flow.suppressErrors &&
      !allowOverflow
    ) {
      throw Error(
        'Bindery: Moved to new page when last one is still overflowing',
      );
    }
  }

  hasOverflowed() {
    if (this._needsUpdate) {
      this.performUpdate();
      console.log('preformeed');
    } else {
      console.log('skipped');
    }

    return safeMeasure(this.element, () => this.flow.hasOverflowed());
  }
}

export default Page;
