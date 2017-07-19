import h from "hyperscript";
import css from "./pageNumber.css";
import BinderyRule from "./BinderyRule";

class PageNumber extends BinderyRule {
  constructor(options) {
    if (!options) options = {};
    options.name = "Page Number";
    super(options);
    this.selector = ".content";
    this.customClass = options.customClass;
  }
  afterBind(pg, i) {
    pg.number = i + 1;
    let el = h(".bindery-num", `${pg.number}`);
    if (this.customClass) {
      el.classList.add(this.customClass);
    }
    pg.element.appendChild(el);
  }
}

export default function(options) {
  return new PageNumber(options);
}
