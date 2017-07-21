import BinderyRule from './BinderyRule';

class PageReference extends BinderyRule {
  constructor(options) {
    options.name = 'Page Reference';
    super(options);
    this.references = {};
  }
  afterAdd(elmt) {
    this.references[elmt.getAttribute('href')] = elmt;
    elmt.removeAttribute('href');
  }
  afterBind(page) {
    Object.keys(this.references).forEach((ref) => {
      if (page.element.querySelector(ref)) {
        this.updateReference(this.references[ref], page.number);
      }
    });
  }
  updateReference(element, number) {
    element.insertAdjacentHTML('afterend', ` (Reference to page ${number})`);
  }
}

export default function (options) {
  return new PageReference(options);
}
