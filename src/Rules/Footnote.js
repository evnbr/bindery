import h from 'hyperscript';
import BinderyRule from './BinderyRule';

class Footnote extends BinderyRule {
  constructor(options) {
    options.name = 'Footnote';
    super(options);
  }
  afterAdd(elmt, state) {
    const number = state.currentPage.footer.querySelectorAll('.footnote').length;

    this.updateReference(elmt, number);

    const fn = h('.footnote');
    fn.innerHTML = this.customContent(elmt, number);
    state.currentPage.footer.appendChild(fn);
  }
  updateReference(elmt, number) {
    elmt.insertAdjacentHTML('beforeEnd', `<sup>${number}</sup>`);
  }
  customContent(elmt, number) {
    return `${number}: Default footnote for "${elmt.textContent.substr(0, 24)}"`;
  }
}

export default function (userOptions) {
  return new Footnote(userOptions);
}
