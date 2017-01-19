import css from "style!css!./controls.css";
import h from "hyperscript";

const btn = function() {
  return h("button.bindery-btn", ...arguments);
}
const btnMain = function() {
  return h("button.bindery-btn.bindery-btn-main", ...arguments);
}

class Controls {
  constructor(opts) {
    this.holder = h("div.bindery-controls");
    document.body.appendChild(this.holder);

    this.binder = opts.binder;

    const start = () => {
      this.setState("working");
      this.binder.bind();
    };
    const done = () => {
      this.binder.cancel();
      this.setState("start");
    };
    const guides = () => {
      this.binder.printer.toggleGuides();
    };
    const interactive = () => {
      this.binder.printer.setInteractive();
    };
    const ordered = () => {
      this.binder.printer.setOrdered();
    };
    const print = () =>  window.print();

    this.states = {
      start: btn({ onclick: start}, "Get Started"),
      working: h("div.bindery-status", "Binding..."),
      done: h("div", {},
        btnMain({style: {float: "right"}, onclick: print}, "Print"),
        btn({style: {float: "right"}, onclick: guides}, "Toggle Guides"),
        btn({style: {float: "right"}, onclick: ordered}, "Grid"),
        btn({style: {float: "right"}, onclick: interactive}, "Preview"),
        btn({onclick: done}, "Done"),
      )
    }
    this.state = ""
    this.setState("start");
  }
  setState(newState) {
    if (newState !== this.state && this.states[newState]) {
      this.state = newState;
      this.holder.innerHTML = "";
      this.holder.appendChild(this.states[newState]);
    }
  }
}

module.exports = Controls;
