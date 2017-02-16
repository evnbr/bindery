let binder = new Bindery({
  source: document.querySelector(".content"),
});

document.getElementById("makeBook").addEventListener("click", function(e) {
  binder.bind();
});


// ------------------
// R U L E S


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
    let fn = Bindery.h(".footnote", {}, `${n} ${elmt.textContent.substr(0,28)}`);
    pg.footer.appendChild(fn);
    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
  },
});

binder.defineRule({
  selector: "a",
  beforeAdd: (elmt, state) => {
    let fn = Bindery.h(".footnote");
    let n = state.currentPage.footer.querySelectorAll(".footnote").length;
    fn.innerHTML = `${n} Link to <a href='#'>${elmt.href}</a>`;
    state.currentPage.footer.appendChild(fn);
    elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
  },
});

binder.defineRule({
  selector: "[bindery-fullpage]",
  beforeAdd: (elmt, state) => {
    let spreadMode = elmt.getAttribute("bindery-fullpage");
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

binder.defineAction({
  selector: ".big-figure",
  rule: Bindery.Rules.Spread,
});
