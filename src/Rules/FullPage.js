import BinderyRule from "./BinderyRule"

let prevPage, prevElementPath;

class FullPage extends BinderyRule {
  constructor(options) {
    options.name = "Full Page Spread"
    super(options);
  }
  beforeAdd(elmt, state) {
    prevPage = state.currentPage;
    prevElementPath = state.path;
    state.currentPage = state.getNewPage();

    //TODO: Rather than just add padding,
    // put full-bleed content on a separate
    // out-of-flow background layer
    if (elmt.classList.contains("bleed")) {
      state.currentPage.element.classList.add("bleed");
    }
  }
  afterAdd(elmt, state) {
    state.currentPage = prevPage;
    state.path = prevElementPath;
  }
}

export default function(userOptions) {
  return new FullPage(userOptions);
}
