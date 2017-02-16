import h from "hyperscript";

export default {
  selector: "a",
  beforeAdd: (elmt, state) => {
    let fn = h(".footnote");
    let n = state.currentPage.footer.querySelectorAll(".footnote").length;
    fn.innerHTML = `${n} Link to <a href='#'>${elmt.href}</a>`;
    state.currentPage.footer.appendChild(fn);
    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
  },
}
