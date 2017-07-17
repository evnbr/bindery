import BinderyRule from "./BinderyRule"
import h from "hyperscript";

class Footnote extends BinderyRule {
  constructor(options) {
    options.name = "Footnote";
    super(options);
  }
  afterAdd(elmt, state) {
    let number = state.currentPage.footer.querySelectorAll(".footnote").length;

    this.updateReference(elmt, number);

    let fn = h(".footnote");
    fn.innerHTML = this.content(elmt, number);
    state.currentPage.footer.appendChild(fn);
  }
  updateReference(elmt, number) {
    elmt.insertAdjacentHTML("beforeEnd", `<sup>${number}</sup>`);
  }
  content(elmt, number) {
    return `${number}: Default footnote for "${elmt.textContent.substr(0,24)}"`
  }
}

export default function(userOptions) {
  return new Footnote(userOptions);
}
