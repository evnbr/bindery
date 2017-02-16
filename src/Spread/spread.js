import css from "style!css!./spread.css";

export default {
  beforeAdd: (elmt, state) => {
    state.prevPage = state.currentPage;
    state.prevElementPath = state.elPath;

    state.currentPage = state.getNewPage();

  },
  afterAdd: (elmt, state) => {
    let dupedContent = state.currentPage.flowContent.cloneNode(true);
    let rightPage = state.getNewPage();
    rightPage.flowBox.innerHTML = "";
    rightPage.flowBox.appendChild(dupedContent);
    rightPage.flowContent = dupedContent;

    // let spreadMode = elmt.getAttribute("bindery-spread");
    // if (spreadMode == "bleed") {
      state.currentPage.element.classList.add("bindery-spread");
      rightPage.element.classList.add("bindery-spread");
      state.currentPage.element.classList.add("bleed");
      rightPage.element.classList.add("bleed");
    // }


    state.finishPage(state.currentPage);
    // state.finishPage(rightPage);

    state.currentPage = state.prevPage;
    state.elPath = state.prevElementPath;
  },
}
