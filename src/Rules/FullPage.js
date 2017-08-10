import Rule from './Rule';

let prevPage;
let prevElementPath;

// Options:
// selector: String

// TODO: Redesign to add entire element in one go, ignoring bleed and any
// internal rules.

class FullPage extends Rule {
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

export default FullPage;
