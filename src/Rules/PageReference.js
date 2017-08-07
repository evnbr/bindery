import Replace from './Replace';

class PageReference extends Replace {
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
