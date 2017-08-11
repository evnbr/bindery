import h from 'hyperscript';
import Replace from './Replace';
import RuleOption from './RuleOption';

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
// render: function (Page) => HTMLElement

class Footnote extends Replace {
  constructor(options) {
    super(options);
    this.name = 'Footnote';
    this.validate(options, {
      selector: RuleOption.string,
      replace: RuleOption.func,
      render: RuleOption.func,
    });
  }
  afterAdd(element, state, requestNewPage, overflowCallback) {
    const number = state.currentPage.footer.children.length + 1;

    const footnote = h('.footnote');
    const contents = this.render(element, number);
    if (contents instanceof HTMLElement) footnote.appendChild(contents);
    else footnote.innerHTML = contents;

    state.currentPage.footer.appendChild(footnote);

    return super.afterAdd(element, state, requestNewPage, (overflowEl) => {
      state.currentPage.footer.removeChild(footnote);
      return overflowCallback(overflowEl);
    });
  }
  createReplacement(state, element) {
    const number = state.currentPage.footer.children.length;
    return this.replace(element, number);
  }
  replace(element, number) {
    element.insertAdjacentHTML('beforeEnd', `<sup class="bindery-sup">${number}</sup>`);
    return element;
  }
  render(element, number) {
    return `<sup>${number}</sup> Default footnote (<a href='http://evanbrooks.info/bindery/#docs'>Docs</a>)`;
  }
}

export default Footnote;
