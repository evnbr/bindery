import h from "hyperscript";
import css from "style!css!./pageNumber.css";


export default  {
  newPage: (pg, state) => {
    let num = h(".bindery-num");
    pg.pageNumber = num;
    pg.element.appendChild(num);
  },
  afterBind: (pg, i) => {

    pg.pageNumber.textContent = (i + 1);
  }
}
