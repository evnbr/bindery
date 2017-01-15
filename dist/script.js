let el = (type, className) => {
  element = document.createElement(type);
  element.classList.add(className);
  return element;
}

let binder = new Bindery({
  source: document.querySelector(".content"),
});

binder.defineRule({
  selector: "[bindery-break='before']",
  beforeAdd: (elmt, state) => {
    if (state.currentPage.flowContent.innerText !== "") {
      state.nextPage();
    }
  },
});

binder.defineRule({
  selector: "p",
  beforeAdd: (elmt, state) => {
    let fn = el("div", "footnote");
    let pg = state.currentPage;
    let n = pg.footer.querySelectorAll(".footnote").length;
    fn.textContent = `${n} ${elmt.textContent.substr(0,28)}`;
    pg.footer.appendChild(fn);
    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
  },
});

binder.defineRule({
  selector: "a",
  beforeAdd: (elmt, state) => {
    let fn = el("div", "footnote");
    let pg = state.currentPage;
    let n = pg.footer.querySelectorAll(".footnote").length;
    fn.innerHTML = `${n} Link to <a href='#'>${elmt.href}</a>`;
    pg.footer.appendChild(fn);
    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
  },
});



binder.bind((book) => {
  console.log(book);
});
