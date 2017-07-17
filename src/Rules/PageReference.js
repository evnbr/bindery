import BinderyRule from "./BinderyRule";

class PageReference extends BinderyRule {
  constructor(options) {
    options.name = "Page Reference";
    super(options);
    this.references = {};
  }
  afterAdd(elmt, state) {
    this.references[elmt.getAttribute("href")] = elmt;
    elmt.removeAttribute("href");
  }
  afterBind(pg, i) {
    for (let ref in this.references) {
      if (pg.element.querySelector(ref)) {
        this.updateReference(this.references[ref], pg.number);
      }
    }
  }
  updateReference(element, number) {
    element.insertAdjacentHTML("afterend", ` (Reference to page ${number})`);
  }
}

export default function(options) {
  return new PageReference(options);
}
