import css from "./spread.css";
import BinderyRule from "./BinderyRule"


class Spread extends BinderyRule {
  constructor(options) {
    options.name = "Spread";
    super(options);

    this.prevPage = null;
    this.prevElementPath = null;
  }
  beforeAdd(elmt, state) {
    this.prevPage = state.currentPage;
    this.prevElementPath = state.path;

    state.currentPage = state.getNewPage();
  }
  afterAdd(elmt, state) {
    let leftPage = state.currentPage;
    let dupedContent = leftPage.flowContent.cloneNode(true);
    let rightPage = state.getNewPage();
    rightPage.flowBox.innerHTML = "";
    rightPage.flowBox.appendChild(dupedContent);
    rightPage.flowContent = dupedContent;

    leftPage.element.classList.add("bindery-spread");
    leftPage.element.classList.add("bleed");
    leftPage.setPreference("left");
    leftPage.setOutOfFlow(true);

    rightPage.element.classList.add("bindery-spread");
    rightPage.element.classList.add("bleed");
    rightPage.setPreference("right");
    rightPage.setOutOfFlow(true);

    state.currentPage = this.prevPage;
    state.path = this.prevElementPath;
  }
}

export default function(userOptions) {
  return new Spread(userOptions);
}
