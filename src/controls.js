import css from "style!css!./controls.css";
import el from "./el";
import h from "hyperscript";

// <div bindery-controls>
//   <button bindery-btn onClick="binder.cancel();">Cancel</button>
//
//   <div style="display: inline-block; margin-left: 20px;">
//     <button bindery-btn>Sequential</button>
//     <button bindery-btn>Booklet</button>
//   </div>
//   <div style="display: inline-block; margin-left: 20px;">
//     <button bindery-btn onClick="binder.printer.toggleGuides();">Guides</button>
//     <button bindery-btn onClick="binder.printer.toggleGuides();">Preview</button>
//   </div>
//
//   <div style="float: right;">
//     <button bindery-btn onClick="binder.bind();">Bind</button>
//     <button bindery-btn onClick="window.print();">Print</button>
//   </div>
// </div>


class Controls {
  constructor(opts) {
    this.holder = el("div", {"bindery-controls": true});
    document.body.appendChild(this.holder);

    this.states = {
      start: el(
          "button",
          {
            "bindery-btn": true,
            onClick: () => {
                binder.bind();
                this.setState("working");
            }
          },
          "Bind"
        ),
      working: el("div", { "bindery-status": true }, "Binding..."),
      done: el(
          "button",
          {
            "bindery-btn": true,
            onClick: () => {  window.print(); }
          },
          "Print"
        ),
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
