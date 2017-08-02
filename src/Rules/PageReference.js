import BinderyRule from './BinderyRule';

class PageReference extends BinderyRule {
  constructor(options) {
    options.name = 'Page Reference';
    super(options);
    this.references = {};
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

      this.references[ref] = elmt;

      state.book.firstPageForSelector(ref, (number) => {
        const parent = elmt.parentNode;
        const newEl = this.replace(elmt, number);
        parent.replaceChild(newEl, elmt);
      });
    }
    return elmt;
  }
  replace(original, number) {
    original.insertAdjacentHTML('beforeend', ` ↝ Page ${number}`);
    return original;
  }
}

export default function (options) {
  return new PageReference(options);
}
