import css from "style!css!./controls.css";
import h from "hyperscript";

const btn = function() {
  return h("button.bindery-btn", ...arguments);
}
const btnMain = function() {
  return h("button.bindery-btn.bindery-btn-main", ...arguments);
}
const btnToggle = function() {
  return h("button.bindery-btn.bindery-btn-toggle", ...arguments);
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
      this.binder.printer.toggleInteractive();
    };
    const double = () => {
      this.binder.printer.toggleDouble();
    };
    const print = () =>  {
      this.binder.printer.setGrid();
      window.print();
    }

    this.states = {
      // start: , btn({ onclick: start}, "Get Started"),
      working: h("div.bindery-status", "Binding..."),
      done: h("div", {},
        btnMain({style: {float: "right"}, onclick: print}, "Print"),
        btnToggle({style: {float: "right"}, onclick: interactive}, "Preview"),
        btn({style: {float: "right"}, onclick: guides}, "Guides"),
        btnToggle({style: {float: "right"}, onclick: double}, "Facing Pages"),
        btn({onclick: done}, "Done"),
      )
    }
    this.state = ""
    this.setState("start");
  }
  setState(newState) {
    this.holder.style.display = (newState == "start") ? "none" : "block";

    if (newState !== this.state && this.states[newState]) {
      this.state = newState;
      this.holder.innerHTML = "";
      this.holder.appendChild(this.states[newState]);
    }
  }
}

module.exports = Controls;
