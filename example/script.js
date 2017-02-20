let binder = new Bindery({
  source: ".content",
  rules: {
    "h2": Bindery.rule.breakBefore,
    "a": Bindery.rule.footnote((elmt) => `Link to <a href='#'>${elmt.href}</a>`),
    "p": Bindery.rule.footnote((elmt) => elmt.textContent.substr(0,28)),
    ".med-figure": Bindery.rule.fullPage,
    ".big-figure": Bindery.rule.spread,
  },
});
