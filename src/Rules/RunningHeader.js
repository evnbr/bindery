import BinderyRule from "./BinderyRule";
import h from "hyperscript";
import css from "./runningHeader.css";

class RunningHeader extends BinderyRule {
  constructor(options) {
    options.name = "Running Header";
    super(options);
    this.customClass = options.customClass;
    this.currentHeaderContent = "";
  }
  infoGetter(elmt) {
    return { text: elmt.textContent }
  }
  afterAdd(elmt, state) {
    this.currentHeaderContent = elmt.textContent;
    state.currentPage.runningHeader.textContent = "";
  }
  afterPageCreated(pg, state) {
    let el = h(".bindery-running-header");
    if (this.customClass) {
      el.classList.add(this.customClass);
    }
    pg.runningHeader = el;
    pg.element.appendChild(el);
    pg.runningHeader.textContent = this.currentHeaderContent;
  }
}

export default function(userOptions) {
  return new RunningHeader(userOptions);
}
