import h from "hyperscript";

export default function(textGetter) {
  return {
    beforeAdd: (elmt, state) => {
      let fn = h(".footnote");
      let n = state.currentPage.footer.querySelectorAll(".footnote").length;
      fn.innerHTML = n + " " + textGetter(elmt);
      state.currentPage.footer.appendChild(fn);
      elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
    },
  }
}
