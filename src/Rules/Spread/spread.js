import css from "style!css!./spread.css";

let prevPage, prevElementPath;

export default {
  beforeAdd: (elmt, state) => {
    prevPage = state.currentPage;
    prevElementPath = state.elPath;

    state.currentPage = state.getNewPage();

  },
  afterAdd: (elmt, state) => {
    let dupedContent = state.currentPage.flowContent.cloneNode(true);
    let rightPage = state.getNewPage();
    rightPage.flowBox.innerHTML = "";
    rightPage.flowBox.appendChild(dupedContent);
    rightPage.flowContent = dupedContent;

    state.currentPage.element.classList.add("bindery-spread");
    rightPage.element.classList.add("bindery-spread");
    state.currentPage.element.classList.add("bleed");
    rightPage.element.classList.add("bleed");

    state.finishPage(state.currentPage);

    state.currentPage = prevPage;
    state.elPath = prevElementPath;
  },
}
