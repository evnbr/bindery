let el = (selector, attrs, text) => {

  let tags = selector.match(/^([a-zA-Z]+)/g);
  let ids = selector.match(/#([a-zA-Z0-9\-\_]+)/g);
  let classes = selector.match(/\.([a-zA-Z0-9\-\_]+)/g);

  let element = document.createElement(tags ? tags[0] : "div");

  if (ids) element.id = ids[0].substr(1);
  if (classes) element.className = classes.map((c) => c.substr(1) ).join(" ");
  if (text) element.textContent = text;
  if (attrs) {
    for (key in attrs) {
      element.setAttribute(key, attrs[key]);
    }
  }

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
    let pg = state.currentPage;
    let n = pg.footer.querySelectorAll(".footnote").length;
    let fn = el(".footnote", {}, `${n} ${elmt.textContent.substr(0,28)}`);
    pg.footer.appendChild(fn);
    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
  },
});

binder.defineRule({
  selector: "a",
  beforeAdd: (elmt, state) => {
    let fn = el(".footnote");
    let n = state.currentPage.footer.querySelectorAll(".footnote").length;
    fn.innerHTML = `${n} Link to <a href='#'>${elmt.href}</a>`;
    state.currentPage.footer.appendChild(fn);
    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
  },
});

binder.defineRule({
  selector: "[bindery-spread]",
  beforeAdd: (elmt, state) => {
    let spreadMode = elmt.getAttribute("bindery-spread");
    state.prevPage = state.currentPage;
    state.prevElementPath = state.elPath;
    state.currentPage = state.getNewPage();
    if (spreadMode == "bleed") {
      state.currentPage.element.classList.add("bleed");
    }
  },
  afterAdd: (elmt, state) => {
    state.finishPage(state.currentPage);
    state.currentPage = state.prevPage;
    state.elPath = state.prevElementPath;
  },
});

// setTimeout(() => {
//   binder.bind((book) => {
//     console.log(book);
//   });
// }, 500);
