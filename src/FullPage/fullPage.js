import css from "style!css!./fullPage.css";

export default {
  beforeAdd: (elmt, state) => {
    let spreadMode = elmt.getAttribute("bindery-fullpage");
    state.prevPage = state.currentPage;
    state.prevElementPath = state.elPath;
    state.currentPage = state.getNewPage();
    if (spreadMode == "bleed") {
      state.currentPage.element.classList.add("bleed");
    }
  },
  afterAdd: (elmt, state) => {
    state.finishPage(state.currentPage);
    state.currentPage = state.prevPage;
    state.elPath = state.prevElementPath;
  },
}
