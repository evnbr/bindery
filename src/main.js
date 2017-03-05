import css from "style!css!./bindery.css";

import makePages from "./makePages";

import Page from "./Page/page";
import Viewer from "./Viewer/viewer";
import Controls from "./Controls/controls";

import Rules from "./Rules/";

import h from "hyperscript";


class Binder {
  constructor(opts) {

    if (typeof opts.source == "string") {
      this.source = document.querySelector(opts.source)
    }
    else if (opts.source instanceof HTMLElement) {
      this.source = opts.source;
    }
    else {
      console.error(`Bindery: Source should be an element or selector`);
    }

    this.controls = new Controls({binder: this});

    if (opts.pageSize) Page.setSize(opts.pageSize);
    if (opts.margin) Page.setMargin(opts.margin);

    this.rules = [];
    if (opts.rules) this.addRules(opts.rules);

    this.debugDelay = opts.debugDelay ? opts.debugDelay : 0;
  }

  cancel() {
    this.viewer.cancel();
    this.source.style.display = "";
  }

  addRules(rules) {
    for (let selector in rules) {
      if (!rules[selector] ) {
        console.warn(`Bindery: Unknown rule for "${selector}"`);
        continue;
      }
      rules[selector].selector = selector;
      this.rules.push(rules[selector]);
    }
  }

  makeBook(doneBinding) {
    let content = this.source.cloneNode(true);
    this.source.style.display = "none";

    makePages(content, this.rules, (pages) => {
      this.viewer = new Viewer({
        pages: pages,
      });

      this.viewer.update();
      this.controls.setState("done");

    }, this.debugDelay);
  }

}


for (let rule in Rules) {
  Binder[rule] = Rules[rule];
}

module.exports = Binder;
