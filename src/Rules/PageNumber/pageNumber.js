import h from "hyperscript";
import css from "style!css!./pageNumber.css";


export default {
  newPage: (pg, state) => {
    // let el = h(".bindery-num", "#");
    // pg.number = el;
    // pg.element.appendChild(el);
  },
  afterBind: (pg, i) => {
    let el = h(".bindery-num", "#");
    pg.number = el;
    pg.element.appendChild(el);
    pg.number.textContent = (i + 1);
  }
}
