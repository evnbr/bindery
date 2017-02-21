import h from "hyperscript";
import css from "style!css!./runningHeader.css";


let headerContent = "";
export default {
  afterAdd: (elmt, state) => {
    headerContent = elmt.textContent;
    state.currentPage.runningHeader.textContent = "";
  },
  newPage: (pg, state) => {
    let el = h(".bindery-running-header");
    pg.runningHeader = el;
    pg.element.appendChild(el);
    pg.runningHeader.textContent = headerContent;
  },
}
