import paginate from "./paginate";

import Page from "./Page/page";
import Viewer from "./Viewer/viewer";
import Controls from "./Controls/controls";

import Rules from "./Rules/";


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
    let pageMargin = opts.pageMargin ? opts.pageMargin : DEFAULT_PAGE_MARGIN
    this.setSize(pageSize);
    this.setMargin(pageMargin);

    this.rules = [];
    if (opts.rules) this.addRules(opts.rules);

    this.debugDelay = opts.debugDelay ? opts.debugDelay : 0;

    if (opts.runImmeditately) {
      this.runImmeditately = true;
      this.makeBook();
    }
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

  isSizeValid() {
    return Page.isSizeValid();
  }

  addRules(newRules) {
    newRules.forEach((rule) => {
      if (rule instanceof Rules.BinderyRule) {
        this.rules.push(rule);
      }
      else {
        console.warn("Bindery: The following is not an instance of BinderyRule and will be ignored:");
        console.warn(rule);
      }
    })
  }

  makeBook(doneBinding) {

    if (!this.isSizeValid()) {
      console.error("Bindery: Cancelled pagination. Page is too small.");
      return;
    }

    this.stopCheckingLayout();

    this.source.style.display = "";
    let content = this.source.cloneNode(true);
    this.source.style.display = "none";

    // In case we're updating an existing layout
    document.body.classList.remove("bindery-viewing");
    document.body.classList.add("bindery-inProgress");

    if (!this.controls) {
      this.controls = new Controls({binder: this});
    }

    this.controls.setInProgress();

    paginate(content, this.rules, (pages) => {
      if (!this.viewer) {
        this.viewer = new Viewer()
      }

      setTimeout(() => {
        this.viewer.pages = pages,
        this.viewer.update();

        this.controls.setDone();
        if (doneBinding) doneBinding();
        document.body.classList.remove("bindery-inProgress");
        this.startCheckingLayout()

      }, 100);



    }, this.debugDelay);
  }

  startCheckingLayout() {
    this.layoutChecker = setInterval(() => {
      this.checkLayoutChange()
    }, 500);
  }
  stopCheckingLayout() {
    if (this.layoutChecker) {
      clearInterval(this.layoutChecker);
      this.pageOverflows = null;
    }
  }

  checkLayoutChange() {
    if ( !this.pageOverflows) {
      this.pageOverflows = this.getPageOverflows();
      return;
    }
    else {
      let newOverflows = this.getPageOverflows();
      if (!arraysEqual(newOverflows, this.pageOverflows)) {
        // console.info("Layout changed");
        this.throttledUpdateBook()
        this.pageOverflows = newOverflows;
      }
    }
  }

  throttledUpdateBook() {
    if (this.makeBookTimer) clearTimeout(this.makeBookTimer);
    this.makeBookTimer = setTimeout(() => {
      this.makeBook()
    }, 500)
  }

  getPageOverflows() {
    return this.viewer.pages.map((page) => page.overflowAmount())
  }

}

let arraysEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}


for (let rule in Rules) {
  Binder[rule] = Rules[rule];
}

module.exports = Binder;
