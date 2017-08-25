import Replace from './Replace';
import RuleOption from './RuleOption';
import { makeRanges } from '../utils';

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement

class PageReference extends Replace {
  constructor(options) {
    super(options);
    this.name = 'Page Reference';
    this.validate(options, {
      selector: RuleOption.string,
      replace: RuleOption.func,
      createTest: RuleOption.func,
    });
  }
  afterAdd(elmt, state) {
    const test = this.createTest(elmt);
    if (test) {
      // Temporary, to make sure it'll fit
      const parent = elmt.parentNode;
      const tempClone = elmt.cloneNode(true);
      const temp = this.replace(tempClone, '###');
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
      // in case it starts with a number :( thanks wikipedia
      selector = `[id="${selector}"]`;
      return el => el.querySelector(selector);
    }
    return null;
  }
  replace(original, number) {
    original.insertAdjacentHTML('beforeend', `, ${number}`);
    return original;
  }
}

export default PageReference;
