import BinderyRule from './BinderyRule';

let prevPage;
let prevElementPath;

class FullPage extends BinderyRule {
  constructor(options) {
    options.name = 'Full Page Spread';
    super(options);
  }
  beforeAdd(elmt, state, requestNewPage) {
    prevPage = state.currentPage;
    prevElementPath = state.path;

    requestNewPage();

    // TODO: Rather than just add padding,
    // put full-bleed content on a separate
    // out-of-flow background layer
    if (elmt.classList.contains('bleed')) {
      state.currentPage.element.classList.add('bleed');
    }

    return elmt;
  }
  afterAdd(elmt, state) {
    state.currentPage = prevPage;
    state.path = prevElementPath;
    return elmt;
  }
}

export default function (userOptions) {
  return new FullPage(userOptions);
}
