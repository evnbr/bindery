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
    let guidesToggle = toggle({onclick: guides}, "Show Guides");
    let bleedToggle = toggle({onclick: bleed}, "Show Bleed");
    let facingToggle = toggle({onclick: facing}, "Facing Pages");
    facingToggle.classList.add("selected")
    let doneBtn = btn({onclick: done}, "Done");


    const widthInput = h("input", { type: "number", value: this.binder.pageSize.width })
    const heightInput = h("input", { type: "number", value: this.binder.pageSize.height })

    let updateDelay
    const throttledUpdate = () => {
      clearTimeout(updateDelay)
      updateDelay = setTimeout(updateLayout, 500)
    }
    const updateLayout = () => {
      let newH = heightInput.value
      let newW = widthInput.value
      if (this.binder.pageSize.width !== newW || this.binder.pageSize.height !== newH) {
        this.binder.setSize({height: newH, width: newW})
        this.binder.makeBook();
      }
    }

    heightInput.addEventListener("change", throttledUpdate)
    widthInput.addEventListener("change", throttledUpdate)
    heightInput.addEventListener("keyup", throttledUpdate)
    widthInput.addEventListener("keyup", throttledUpdate)

    const heightControl = h(".bindery-val", heightInput, h("div", "Height"))
    const widthControl = h(".bindery-val", widthInput, h("div", "Width"))

    const updateBtn = btn({onclick: updateLayout}, "Rebuild Layout");


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
        widthControl,
        heightControl,
        updateBtn,
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
