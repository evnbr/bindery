let binder = new Bindery({
  source: ".content",
  rules: [
    { selector: "h2",          rule: Bindery.rule.breakBefore },
    { selector: "a",           rule: Bindery.rule.footnote },
    { selector: ".med-figure", rule: Bindery.rule.fullPage },
    { selector: ".big-figure", rule: Bindery.rule.spread }
  ]
});

document.getElementById("makeBook").addEventListener("click", function(e) {
  binder.bind();
});

// binder.defineRule({
//   selector: "p",
//   beforeAdd: (elmt, state) => {
//     let pg = state.currentPage;
//     let n = pg.footer.querySelectorAll(".footnote").length;
//     let fn = h(".footnote", {}, `${n} ${elmt.textContent.substr(0,28)}`);
//     pg.footer.appendChild(fn);
//     elmt.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
//   },
// });
