import Replace from './Replace';
import { makeRanges, shallowEqual } from '../utils';
import { validate, T } from '../option-checker';
import { c } from '../dom';

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
  }
  afterAdd(elmt, book) {
    const test = this.createTest(elmt);
    if (test) {
      return this.createReference(book, test, elmt);
    }
    return elmt;
  }

  createReference(book, test, elmt) {
    // Replace element immediately, to make sure it'll fit
    const parent = elmt.parentNode;
    const tempClone = elmt.cloneNode(true);
    const temp = this.replace(tempClone, '?');
    temp.classList.add(c('placeholder-pulse'));
    parent.replaceChild(temp, elmt);

    let previousNumbers = null;
    let previousRender = temp;
    book.registerPageReference(test, (pageNumbers) => {
      if (shallowEqual(pageNumbers, previousNumbers)) return;
      const isResolved = pageNumbers.length > 0;
      const tempParent = previousRender.parentNode;
      const updatedEl = elmt.cloneNode(true);
      const pageRanges = isResolved ? makeRanges(pageNumbers) : '?';
      const newRender = this.replace(updatedEl, pageRanges);
      if (!isResolved) newRender.classList.add(c('placeholder-pulse'));
      tempParent.replaceChild(newRender, previousRender);
      previousRender = newRender;
      previousNumbers = pageNumbers;
    });

    return temp;
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
  replace(original, number) {
    original.insertAdjacentHTML('beforeend', `, <span>${number}</span>`);
    return original;
  }
}

export default PageReference;
