import css from "style!css!./fullPage.css";

export default {
  beforeAdd: (elmt, state) => {
    state.prevPage = state.currentPage;
    state.prevElementPath = state.elPath;
    state.currentPage = state.getNewPage();
    if (elmt.classList.contains("bleed")) {
      state.currentPage.element.classList.add("bleed");
    }
  },
  afterAdd: (elmt, state) => {
    state.currentPage = state.prevPage;
    state.elPath = state.prevElementPath;
  },
}
