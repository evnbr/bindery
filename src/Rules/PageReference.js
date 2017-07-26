import BinderyRule from './BinderyRule';

class PageReference extends BinderyRule {
  constructor(options) {
    options.name = 'Page Reference';
    super(options);
    this.references = {};
  }
  afterAdd(elmt) {
    this.references[elmt.getAttribute('href')] = elmt;
  }
  afterBind(page) {
    Object.keys(this.references).forEach((ref) => {
      if (page.element.querySelector(ref)) {
        const original = this.references[ref];
        const parent = original.parentNode;
        const newEl = this.replace(original, page.number);
        parent.replaceChild(newEl, original);
      }
    });
  }
  replace(original, number) {
    // original.removeAttribute('href');
    original.insertAdjacentHTML('beforeend', ` ⇝ Page ${number}`);
    return original;
  }
}

export default function (options) {
  return new PageReference(options);
}
