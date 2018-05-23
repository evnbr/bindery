import Replace from './Replace';
import { pageNumbersForTest, formatAsRanges } from './searchPages';

import { shallowEqual, oncePerFrameLimiter } from '../utils';
import { validate, T } from '../option-checker';
import { c } from '../dom-utils';

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
class PageReference extends Replace {
  constructor(options) {
    super(options);
    validate(options, {
      name: 'PageReference',
      selector: T.string,
      replace: T.func,
      createTest: T.func,
    });
    this.references = [];
    const throttle = oncePerFrameLimiter();
    this.throttledUpdate = (book) => {
      throttle(() => this.updatePageReferences(book.pages));
    };
  }

  eachPage(page, book) {
    this.throttledUpdate(book);
  }

  afterAdd(elmt, book) {
    const test = this.createTest(elmt);
    if (test) {
      return this.createReference(book, test, elmt);
    }
    return elmt;
  }

  createReference(book, test, elmt) {
    const ref = { test, template: elmt, element: elmt, value: null };
    const render = newValue => this.render(ref, newValue);
    ref.render = render;
    this.references.push(ref);
    render(ref, []); // Replace element immediately, to make sure it'll fit
    return ref.element;
  }

  render(ref, newValue) {
    if (shallowEqual(ref.value, newValue)) return;
    const isResolved = newValue.length > 0;
    const pageRanges = isResolved ? formatAsRanges(newValue) : '?';

    const template = ref.template.cloneNode(true);
    const newRender = this.replace(template, pageRanges);
    if (!isResolved) newRender.classList.add(c('placeholder-pulse'));
    ref.element.parentNode.replaceChild(newRender, ref.element);
    ref.element = newRender;
    ref.value = newValue;
  }

  createTest(element) {
    let selector = element.getAttribute('href');
    if (selector) {
      selector = selector.replace('#', '');
      // extra resilient in case it starts with a number ie wikipedia
      selector = `[id="${selector}"]`;
      return el => el.querySelector(selector);
    }
    return null;
  }

  updatePageReferences(pages) {
    // querySelector first, then rerender
    const results = this.references.map(ref => pageNumbersForTest(pages, ref.test));
    this.references.forEach((ref, i) => ref.render(results[i]));
  }

  replace(template, number) {
    template.insertAdjacentHTML('beforeend', `, <span>${number}</span>`);
    return template;
  }
}

export default PageReference;
