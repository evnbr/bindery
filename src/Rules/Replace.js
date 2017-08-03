import Rule from './Rule';

class Replace extends Rule {
  constructor(options) {
    options.name = 'Footnote';
    super(options);
  }
  afterAdd(element, state, requestNewPage, overflowCallback) {
    const parent = element.parentNode;
    if (!parent) {
      throw Error('Bindery: Rule assumes element has been added but it has no parent.', element);
    }
    const defensiveClone = element.cloneNode(true);
    const replacement = this.replace(defensiveClone);
    parent.replaceChild(replacement, element);

    if (state.currentPage.hasOverflowed()) {
      parent.replaceChild(element, replacement);

      return overflowCallback(element);
    }

    return replacement;
  }
  replace(element) {
    element.insertAdjacentHTML('beforeEnd', '<sup class="bindery-sup">Default Replacement</sup>');
    return element;
  }
}

export default function (userOptions) {
  return new Replace(userOptions);
}
