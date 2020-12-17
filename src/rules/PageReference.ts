import Replace from './Replace';
import { formatAsRanges } from '../utils';
import { Book, Page, pageNumbersForTest } from '../book';

import { shallowEqual, throttleTime } from '../utils';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';
import { prefixer } from '../dom';

// Compatible with ids that start with numbers
const startsWithNumber = (sel: string) => {
  return sel.length > 2 && sel[0] === '#' && /^\d+$/.test(sel[1]);
};
const safeIDSel = (sel: string) => {
  return startsWithNumber(sel) ? `[id="${sel.replace('#', '')}"]` : sel;
};

declare type TestFunction = (el: HTMLElement) => boolean;

interface PageReferenceInstance {
  previousMatches: number[] | undefined;
  element: HTMLElement;
  template: HTMLElement;
  testFunction: TestFunction;
}

export interface PageReferenceRuleOptions {
  selector: string,
  replace: (element: HTMLElement, number: string | number) => HTMLElement,
  createTest: (element: HTMLElement) => TestFunction,
}

class PageReference extends Replace {
  references: PageReferenceInstance[];
  throttledUpdate: (book: Book) => void;

  constructor(options: Partial<PageReferenceRuleOptions>) {
    super(options);
    validateRuntimeOptions(options, {
      name: 'PageReference',
      selector: RuntimeTypes.string,
      replace: RuntimeTypes.func,
      createTest: RuntimeTypes.func,
    });
    this.references = [];
    const throttle = throttleTime(10);
    this.throttledUpdate = book => {
      throttle(() => this.updatePageReferences(book.pages));
    };
  }

  eachPage(page: Page, book: Book) {
    this.throttledUpdate(book);
  }

  afterAdd(elmt: HTMLElement, book: Book) {
    const test = this.createTest(elmt);
    if (!test) return elmt;

    const ref = this.createReference(book, test, elmt);
    return ref.element;
  }

  createReference(
    book: Book,
    testFunction: TestFunction,
    elmt: HTMLElement,
  ): PageReferenceInstance {
    const ref: PageReferenceInstance = {
      testFunction,
      template: elmt,
      element: elmt,
      previousMatches: undefined,
    };
    this.references.push(ref);
    const currentResults = pageNumbersForTest(book.pages, testFunction);

    this.render(ref, currentResults); // Replace element immediately, to make sure it'll fit
    return ref;
  }

  render(ref: PageReferenceInstance, matchingPageNumbers: number[]) {
    if (ref.previousMatches && shallowEqual(ref.previousMatches, matchingPageNumbers)) {
      return;
    }

    if (!Array.isArray(matchingPageNumbers)) {
      throw Error('Page search returned unexpected result');
    }

    const hasFoundPage = matchingPageNumbers.length > 0;
    const pageRanges = hasFoundPage ? formatAsRanges(matchingPageNumbers) : '⌧';

    const template = ref.template.cloneNode(true) as HTMLElement;
    const newRender = this.replace(template, pageRanges);
    if (!hasFoundPage) newRender.classList.add(prefixer('placeholder-num'));
    ref.element.parentNode!.replaceChild(newRender, ref.element);

    ref.element = newRender;
    ref.previousMatches = matchingPageNumbers;
  }

  createTest(element: HTMLElement): TestFunction | null {
    const href = element.getAttribute('href');
    if (!href) return null;
    const selector = safeIDSel(href);
    return (el: HTMLElement) => {
      return !!el.querySelector(selector);
    };
  }

  updatePageReferences(pages: Page[]) {
    // querySelector first, then rerender
    const results = this.references.map(ref => {
      return { ref, matchingPageNumbers: pageNumbersForTest(pages, ref.testFunction) };
    });

    results.forEach(({ ref, matchingPageNumbers }) => this.render(ref, matchingPageNumbers));
  }

  replace(template: HTMLElement, number: string | number) {
    template.insertAdjacentHTML('beforeend', `, <span>${number}</span>`);
    return template;
  }
}

export default PageReference;
