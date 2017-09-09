import Replace from './Replace';
import { OptionType, makeRanges } from '../utils';
import c from '../utils/prefixClass';

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement

class PageReference extends Replace {
  constructor(options) {
    super(options);
    this.name = 'Page Reference';
    OptionType.validate(options, {
      selector: OptionType.string,
      replace: OptionType.func,
      createTest: OptionType.func,
    });
  }
  afterAdd(elmt, state) {
    const test = this.createTest(elmt);
    if (test) {
      // Temporary, to make sure it'll fit
      const parent = elmt.parentNode;
      const tempClone = elmt.cloneNode(true);
      const tempNumbers = state.book.pagesForTest(test);
      const tempRanges = makeRanges(tempNumbers);
      const temp = this.replace(tempClone, tempRanges || '###');
      temp.classList.add(c('placeholder-pulse'));
      parent.replaceChild(temp, elmt);

      state.book.onComplete(() => {
        const tempParent = temp.parentNode;
        const finalClone = elmt.cloneNode(true);
        const pageNumbers = state.book.pagesForTest(test);
        const pageRanges = makeRanges(pageNumbers);
        const newEl = this.replace(finalClone, pageRanges);
        tempParent.replaceChild(newEl, temp);
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
