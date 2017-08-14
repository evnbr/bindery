import Replace from './Replace';
import RuleOption from './RuleOption';

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement

const makeRanges = arr => arr.reduce((soFar, curr, i) => {
  if (i === 0) return soFar + curr;
  const prev = arr[i - 1];
  if (i === arr.length - 1) return `${soFar}–${curr}`;
  if (curr === prev + 1) return soFar;
  if (i === 1) return `${soFar}, ${curr}`;
  return `${soFar}–${prev}, ${curr}`;
}, '');

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
