import css from "style!css!./bindery.css";

import makePages from "./makePages";

import Page from "./Page/page";
import Viewer from "./Viewer/viewer";
import Controls from "./Controls/controls";

import Rules from "./Rules/";

import h from "hyperscript";


const DEFAULT_PAGE_SIZE = {
  width: 300,
  height: 400
}
const DEFAULT_PAGE_MARGIN = {
  inner: 30,
  outer: 50,
  bottom: 60,
  top: 40
}

class Binder {
  constructor(opts) {
    if (!opts.source) {
      console.error(`Bindery: You must include a source element or selector`);
    }
    else if (typeof opts.source == "string") {
      this.source = document.querySelector(opts.source)
      if (!(this.source instanceof HTMLElement)) {
        console.error(`Bindery: Could not find element that matches selector "${opts.source}"`);
        return
      }
    }
    else if (opts.source instanceof HTMLElement) {
      this.source = opts.source;
    }
    else {
      console.error(`Bindery: Source must be an element or selector`);
    }

    let pageSize = opts.pageSize ? opts.pageSize : DEFAULT_PAGE_SIZE
    let pageMargin = opts.margin ? opts.margin : DEFAULT_PAGE_MARGIN
    this.setSize(pageSize);
    this.setMargin(pageMargin);

    this.controls = new Controls({binder: this});

    this.rules = [];
    if (opts.rules) this.addRules(opts.rules);

    this.debugDelay = opts.debugDelay ? opts.debugDelay : 0;
  }

  cancel() {
    this.viewer.cancel();
    document.body.classList.remove("bindery-viewing");
    this.source.style.display = "";
  }

  setSize(size) {
    this.pageSize = size
    Page.setSize(size);
  }

  setMargin(margin) {
    this.pageMargin = margin
    Page.setMargin(margin);
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
    this.source.style.display = "";
    let content = this.source.cloneNode(true);
    this.source.style.display = "none";

    // In case we're updating an existing layout
    document.body.classList.remove("bindery-viewing");
    document.body.classList.add("bindery-inProgress");

    makePages(content, this.rules, (pages) => {
      if (!this.viewer) {
        this.viewer = new Viewer()
      }
      this.viewer.pages = pages,
      this.viewer.update();
      this.controls.setState("done");
      document.body.classList.remove("bindery-inProgress");

    }, this.debugDelay);
  }

}


for (let rule in Rules) {
  Binder[rule] = Rules[rule];
}

module.exports = Binder;
