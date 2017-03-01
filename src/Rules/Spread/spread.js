import css from "style!css!./spread.css";

let prevPage, prevElementPath;

export default {
  beforeAdd: (elmt, state) => {
    prevPage = state.currentPage;
    prevElementPath = state.elPath;

    state.currentPage = state.getNewPage();

  },
  afterAdd: (elmt, state) => {
    let leftPage = state.currentPage;
    let dupedContent = leftPage.flowContent.cloneNode(true);
    let rightPage = state.getNewPage();
    rightPage.flowBox.innerHTML = "";
    rightPage.flowBox.appendChild(dupedContent);
    rightPage.flowContent = dupedContent;

    leftPage.element.classList.add("bindery-spread");
    rightPage.element.classList.add("bindery-spread");
    leftPage.element.classList.add("bleed");
    rightPage.element.classList.add("bleed");

    leftPage.setPreference("left");
    rightPage.setPreference("right");
    leftPage.setOutOfFlow(true);
    rightPage.setOutOfFlow(true);

    state.currentPage = prevPage;
    state.elPath = prevElementPath;
  },
}
