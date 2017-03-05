let references = {};

export default {
  afterAdd: (elmt, state) => {
    references[elmt.getAttribute("href")] = elmt;
    elmt.removeAttribute("href");
  },
  afterBind: (pg, i) => {
    for (let ref in references) {
      if (pg.element.querySelector(ref)) {
        references[ref].insertAdjacentHTML(
          "afterend",
          `: <span style="float:right;">${pg.number.textContent}</span>`);
      }
    }
  }
}
