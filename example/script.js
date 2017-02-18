let getLink = (n, elmt) => `${n} Link to <a href='#'>${elmt.href}</a>`;
let getSample = (n, elmt) => `${n} ${elmt.textContent.substr(0,28)}`;

let binder = new Bindery({
  source: ".content",
  rules: [
    { selector: "h2",           rule: Bindery.rule.breakBefore },
    { selector: "a",            rule: Bindery.rule.footnote(getLink) },
    { selector: "p",            rule: Bindery.rule.footnote(getSample) },
    { selector: ".med-figure",  rule: Bindery.rule.fullPage },
    { selector: ".big-figure",  rule: Bindery.rule.spread }
  ],
});
