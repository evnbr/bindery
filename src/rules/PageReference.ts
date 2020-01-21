import Replace from './Replace';
import { pageNumbersForTest, formatAsRanges } from './searchPages';

import { shallowEqual, throttleTime } from '../utils';
import { validate, T } from '../option-checker';
import { c } from '../dom-utils';

// Compatible with ids that start with numbers
const startsWithNumber = (sel: string) => {
  return sel.length > 2 && sel[0] === '#' && /^\d+$/.test(sel[1]);
}
const safeIDSel = (sel: string) => {
  return (startsWithNumber(sel) ? `[id="${sel.replace('#', '')}"]` : sel);
}

interface PageReferenceInstance {
  value: any;
  element: HTMLElement;
  template: HTMLElement;
  render: ((newVal: any) => void);
}

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
class PageReference extends Replace {
  references: PageReferenceInstance[];
  throttledUpdate: (book: any) => void;

  constructor(options) {
    super(options);
    validate(options, {
      name: 'PageReference',
      selector: T.string,
      replace: T.func,
      createTest: T.func,
    });
    this.references = [];
    const throttle = throttleTime(10);
    this.throttledUpdate = (book) => {
      throttle(() => this.updatePageReferences(book.pages));
    };
  }

  eachPage(page, book) {
    this.throttledUpdate(book);
  }

  afterAdd(elmt, book) {
    const test = this.createTest(elmt);
    if (!test) return elmt;

    const ref = this.createReference(book, test, elmt);
    return ref.element;
  }

  createReference(book, test, elmt): PageReferenceInstance {
    const ref = {
      test,
      template: elmt,
      element: elmt,
      value: null,
      render: null
    } as PageReferenceInstance;
    ref.render = (newValue) => {
      return this.render(ref, newValue);
    };
    this.references.push(ref);
    const currentResults = pageNumbersForTest(book.pages, test);

    ref.render(currentResults); // Replace element immediately, to make sure it'll fit
    return ref;
  }

  render(ref: PageReferenceInstance, newValue) {
    if (!newValue || shallowEqual(ref.value, newValue)) return;
    if (!Array.isArray(newValue)) throw Error('Page search returned unexpected result');

    const isResolved = newValue.length > 0;
    const pageRanges = isResolved ? formatAsRanges(newValue) : '⌧';

    const template = ref.template.cloneNode(true);
    const newRender = this.replace(template, pageRanges);
    if (!isResolved) newRender.classList.add(c('placeholder-num'));
    ref.element.parentNode.replaceChild(newRender, ref.element);

    ref.element = newRender;
    ref.value = newValue;
  }

  createTest(element) {
    const href = element.getAttribute('href');
    if (!href) return null;
    const selector = safeIDSel(href);
    return el => el.querySelector(selector);
  }

  updatePageReferences(pages) {
    // querySelector first, then rerender
    const results = this.references.map(ref =>
      ({ ref, data: pageNumbersForTest(pages, ref.test) }));
    results.forEach(({ ref, data }) => this.render(ref, data));
  }

  replace(template, number) {
    template.insertAdjacentHTML('beforeend', `, <span>${number}</span>`);
    return template;
  }
}

export default PageReference;
