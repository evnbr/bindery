import Replace from './Replace';
import RuleOption from './RuleOption';

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
    });
  }
  afterAdd(elmt, state) {
    let ref = elmt.getAttribute('href');
    if (ref) {
      // TODO: Make more robust, validate
      // that selector is valid
      if (ref[0] !== '#') {
        ref = ref.substr(ref.indexOf('#'));
      }
      ref = ref.replace('#', '');
      ref = `[id="${ref}"]`; // in case it starts with a number

      // Temporary, to make sure it'll fit
      const parent = elmt.parentNode;
      const tempClone = elmt.cloneNode(true);
      const temp = this.replace(tempClone, '⏱');
      parent.replaceChild(temp, elmt);

      state.book.firstPageForSelector(ref, (number) => {
        const tempParent = temp.parentNode;
        const finalClone = elmt.cloneNode(true);
        const newEl = this.replace(finalClone, number);
        tempParent.replaceChild(newEl, temp);
      });

      return temp;
    }
    return elmt;
  }
  replace(original, number) {
    original.insertAdjacentHTML('beforeend', ` ↝ Page ${number}`);
    return original;
  }
}

export default PageReference;
