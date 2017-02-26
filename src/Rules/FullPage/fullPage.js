import css from "style!css!./fullPage.css";

let prevPage, prevElementPath;

export default {
  beforeAdd: (elmt, state) => {
    prevPage = state.currentPage;
    prevElementPath = state.path;
    state.currentPage = state.getNewPage();

    //TODO: Rather than just add padding,
    // put full-bleed content on a separate
    // out-of-flow background layer
    if (elmt.classList.contains("bleed")) {
      state.currentPage.element.classList.add("bleed");
    }
  },
  afterAdd: (elmt, state) => {
    state.currentPage = prevPage;
    state.path = prevElementPath;
  },
}
