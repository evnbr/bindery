import css from "style!css!./controls.css";
import h from "hyperscript";

const btn = function() {
  return h("button.bindery-btn", ...arguments);
}
const btnMain = function() {
  return h("button.bindery-btn.bindery-btn-main", ...arguments);
}
const toggle = function() {
  return h(".bindery-toggle", ...arguments, toggleSwitch);
}
const toggleSwitch = function() {
  return h(".bindery-switch", h(".bindery-switch-handle"));
}
const label = function() {
  return h(".bindery-label", ...arguments);
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
      guidesToggle.classList.toggle("selected")
      opts.binder.viewer.toggleGuides();
    };
    const bleed = () => {
      bleedToggle.classList.toggle("selected")
      opts.binder.viewer.toggleBleed();
    };
    const interactivePreview = () => {
      previewToggle.classList.toggle("selected")
      opts.binder.viewer.toggleInteractive();
    };
    const facing = () => {
      facingToggle.classList.toggle("selected")
      opts.binder.viewer.toggleDouble();
    };
    const print = () => {
      opts.binder.viewer.setGrid();
      window.print();
    }

    let printBtn = btnMain({style: {float: "right"}, onclick: print}, "Print");
    let previewToggle = toggle({onclick: interactivePreview}, "Interactive Preview");
    let guidesToggle = toggle({onclick: guides}, "Show Bounds");
    let bleedToggle = toggle({onclick: bleed}, "Show Bleed");
    let facingToggle = toggle({onclick: facing}, "Facing Pages");
    facingToggle.classList.add("selected")
    let doneBtn = btn({onclick: done}, "Done");

    const input = {
      top:    h("input", { type: "number", value: this.binder.pageMargin.top }),
      inner:  h("input", { type: "number", value: this.binder.pageMargin.inner }),
      outer:  h("input", { type: "number", value: this.binder.pageMargin.outer }),
      bottom: h("input", { type: "number", value: this.binder.pageMargin.bottom }),
      width:  h("input", { type: "number", value: this.binder.pageSize.width }),
      height: h("input", { type: "number", value: this.binder.pageSize.height })
    }


    const sizeControl        = h(".bindery-val.bindery-size", h("div", "Width"), input.width, h("div", "Height"), input.height, )
    const vMarginControl    = h(".bindery-val.bindery-size", h("div", "Top"), input.top, h("div", "Bottom"), input.bottom)
    const hMarginControl  = h(".bindery-val.bindery-size", h("div", "Inner"), input.inner, h("div", "Outer"), input.outer)

    const updateBtn = btn({onclick: updateLayout}, "Rebuild Layout");

    let updateDelay
    const throttledUpdate = () => {
      clearTimeout(updateDelay)
      updateDelay = setTimeout(updateLayout, 700)
    }
    const updateLayout = () => {
      let newMargin = {
        top:    input.top.value,
        inner:  input.inner.value,
        outer:  input.outer.value,
        bottom: input.bottom.value,
      }
      let newSize = {
        height: input.height.value,
        width:  input.width.value
      }

      let needsUpdate = false
      for (let k in newMargin) {
        if (this.binder.pageMargin[k] !== newMargin[k]) { needsUpdate = true }
      }
      for (let k in newSize) {
        if (this.binder.pageSize[k] !== newSize[k]) { needsUpdate = true }
      }

      if (needsUpdate) {
        this.binder.setSize(newSize)
        this.binder.setMargin(newMargin)
        this.binder.makeBook();
      }
    }

    for (let k in input) {
      input[k].addEventListener("change", throttledUpdate);
      input[k].addEventListener("keyup", throttledUpdate);
    }


    this.states = {
      // start: , btn({ onclick: start}, "Get Started"),
      working: h("div.bindery-status", "Binding..."),
      done: h("div", {},
        doneBtn,
        printBtn,

        label("View"),
        previewToggle,
        guidesToggle,
        bleedToggle,

        label("Page Setup"),
        facingToggle,
        sizeControl,

        label("Margin"),
        vMarginControl,
        hMarginControl,
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
