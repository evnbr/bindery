import Replace from './Replace';
import { makeRanges } from '../utils';
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
      // Temporary, to make sure it'll fit
      const parent = elmt.parentNode;
      const tempClone = elmt.cloneNode(true);
      const tempNumbers = book.pagesForTest(test);
      const tempRanges = makeRanges(tempNumbers);
      const temp = this.replace(tempClone, tempRanges || '000');
      temp.classList.add(c('placeholder-pulse'));
      parent.replaceChild(temp, elmt);

      let previousRender = temp;
      book.registerPageReference(test, (pageNumbers) => {
        const isResolved = pageNumbers.length > 0;
        const tempParent = previousRender.parentNode;
        const updatedEl = elmt.cloneNode(true);
        const pageRanges = isResolved ? makeRanges(pageNumbers) : '?';
        const newRender = this.replace(updatedEl, pageRanges);
        if (!isResolved) newRender.classList.add(c('placeholder-pulse'));
        tempParent.replaceChild(newRender, previousRender);
        previousRender = newRender;
      });

      return temp;
    }
    return elmt;
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
