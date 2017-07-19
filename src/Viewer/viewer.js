import css from "./viewer.css";

import Page from "../Page/page";
import h from "hyperscript";

class Viewer {
  constructor(opts) {
    this.pages = [];
    this.doubleSided = true;
    this.twoUp = false,
    this.currentLeaf = 0;

    this.export = h(".bindery-export");
    this.export.setAttribute("bindery-export", true);

  }
  displayError(title, text) {
    if (!this.export.parentNode) {
      document.body.appendChild(this.export);
    }
    this.export.appendChild(h(".bindery-error",
      h(".bindery-error-title", title),
      h(".bindery-error-text", text),
      h(".bindery-error-footer", "Bindery.js v0.1 Alpha"),
    ));
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    if (this.export.parentNode) {
      this.export.parentNode.removeChild(this.export);
    }
  }
  toggleGuides() {
    this.export.classList.toggle("bindery-show-guides");
  }
  toggleBleed() {
    this.export.classList.add("bindery-show-bleed");
  }
  toggleDouble() {
    this.doubleSided = !this.doubleSided;
    this.update();
  }
  setMode(newMode) {
    switch (newMode) {
      case "grid":
      case "standard":
      case "default":
        this.mode = "grid";
        break;
      case "interactive":
      case "preview":
      case "3d":
        this.mode = "interactive";
        break;
      case "print":
        this.mode = "print";
        break;
      default:
        console.error(`Bindery: Unknown view mode "${newMode}"`);
        break;
    }
  }
  setGrid() {
    this.mode = "grid";
    this.update();
  }
  setPrint() {
    this.mode = "print";
    this.update();
  }
  setInteractive() {
    this.mode = "interactive";
    this.export.classList.remove("bindery-show-bleed");
    this.update();
  }
  update() {
    if (!this.export.parentNode) {
      document.body.appendChild(this.export);
    }

    document.body.classList.add("bindery-viewing");

    if      (this.mode == "grid")        { this.renderGrid(); }
    else if (this.mode == "interactive") { this.renderInteractive(); }
    else if (this.mode == "print")       { this.renderPrint(); }
    else                                 { this.renderGrid(); }
  }

  renderPrint() {
    this.mode = "print";
    this.export.style.display = "block";
    this.export.classList.add("bindery-show-bleed");

    this.export.innerHTML = "";

    let pages = this.pages.slice();

    if (this.twoUp) {
      if (this.pages.length % 2 !== 0) {
        let pg = new Page();
        pages.push(pg);
      }
      let spacerPage = new Page();
      let spacerPage2 = new Page();
      spacerPage.element.style.visibility = "hidden";
      spacerPage2.element.style.visibility = "hidden";
      pages.unshift(spacerPage);
      pages.push(spacerPage2);
    }

    for (var i = 0; i < pages.length; i += (this.twoUp ? 2 : 1)) {


      if (this.twoUp) {
        let left  = pages[i];
        let right = pages[i+1];

        let leftPage = left.element;
        let rightPage = right.element;

        let wrap = h(".bindery-print-page",
          h(".bindery-print-wrapper", {
            style: {
              height: `${Page.H}px`,
              width: `${Page.W * 2}px`,
            }
          }, leftPage, rightPage)
        );

        this.export.appendChild(wrap);
      }
      else {
        let pg = pages[i].element;
        let wrap = h(".bindery-print-page",
          h(".bindery-print-wrapper", {
            style: {
              height: `${Page.H}px`,
              width: `${Page.W}px`,
            }
          }, pg),
        );
        this.export.appendChild(wrap);
      }
    }


  }

  renderGrid() {
    this.mode = "grid";
    this.export.style.display = "block";
    this.export.classList.remove("bindery-show-bleed");

    this.export.innerHTML = "";

    let pages = this.pages.slice();

    if (this.doubleSided) {
      if (this.pages.length % 2 !== 0) {
        let pg = new Page();
        pages.push(pg);
      }
      let spacerPage = new Page();
      let spacerPage2 = new Page();
      spacerPage.element.style.visibility = "hidden";
      spacerPage2.element.style.visibility = "hidden";
      pages.unshift(spacerPage);
      pages.push(spacerPage2);
    }


    for (var i = 0; i < pages.length; i += (this.doubleSided ? 2 : 1)) {


      if (this.doubleSided) {
        let left  = pages[i];
        let right = pages[i+1];

        let leftPage = left.element;
        let rightPage = right.element;


        leftPage.setAttribute("bindery-side", "left");
        rightPage.setAttribute("bindery-side", "right");

        let wrap = h(".bindery-print-wrapper", {
            style: {
              height: `${Page.H}px`,
              width: `${Page.W * 2}px`,
            }
          }, leftPage, rightPage
        );

        this.export.appendChild(wrap);
      }
      else {
        let pg = pages[i].element;
        pg.setAttribute("bindery-side", "right");
        let wrap = h(".bindery-print-page",
          h(".bindery-print-wrapper", {
            style: {
              height: `${Page.H}px`,
              width: `${Page.W}px`,
            }
          }, pg),
        );
        this.export.appendChild(wrap);
      }
    }
  }
  renderInteractive() {
    this.mode = "interactive";
    this.export.style.display = "block";
    this.export.innerHTML = "";
    this.flaps = [];
    this.export.classList.remove("bindery-show-bleed");

    let pages = this.pages.slice();

    if (this.doubleSided) {
      if (this.pages.length % 2 !== 0) {
        let pg = new Page();
        pages.push(pg);
      }
    }
    let spacerPage = new Page();
    let spacerPage2 = new Page();
    spacerPage.element.style.visibility = "hidden";
    spacerPage2.element.style.visibility = "hidden";
    pages.unshift(spacerPage);
    pages.push(spacerPage2);

    let leafIndex = 0;
    for (let i = 1; i < pages.length - 1; i += (this.doubleSided ? 2 : 1)) {
      leafIndex++;
      let li = leafIndex;
      let flap = h("div.bindery-page3d", {
        style: `height:${Page.H}px; width:${Page.W}px`,
        onclick: () => {
          let newLeaf = li - 1;
          if (newLeaf == this.currentLeaf) newLeaf++;
          this.setLeaf(newLeaf);
        },
      });
      // this.makeDraggable(flap);
      this.export.classList.add("bindery-stage3d");
      this.flaps.push(flap);

      let rightPage = pages[i].element;
      let leftPage;
      rightPage.classList.add("bindery-page3d-front");
      flap.appendChild(rightPage);
      if (this.doubleSided) {
        flap.classList.add("bindery-doubleSided");
        leftPage = pages[i+1].element;
        leftPage.classList.add("bindery-page3d-back");
        flap.appendChild(leftPage);
      }
      else {
        leftPage = h(".bindery-page.bindery-page3d-back")
        flap.appendChild(leftPage);
      }
      // flap.style.zIndex = `${this.pages.length - i}`;
      // flap.style.top = `${i * 4}px`;
      flap.style.left = `${i * 4}px`;

      leftPage.setAttribute("bindery-side", "left");
      rightPage.setAttribute("bindery-side", "right");


      this.export.appendChild(flap);
    }
    if (this.currentLeaf) {
      this.setLeaf(this.currentLeaf);
    }
    else {
      this.setLeaf(0);
    }
  }
  setLeaf(n) {
    this.currentLeaf = n;
    this.flaps.forEach((flap, i) => {
      let z = this.flaps.length - Math.abs(i - n + 0.5);
      // + 0.5 so left and right are even
      flap.style.transform = `translate3d(${(i < n) ? 4 : 0}px,0,${ z * 4 }px) rotateY(${(i < n) ? -180 : 0}deg)`;
    });
  }
  makeDraggable(flap) {
    let isDragging = false;
    let pct = 0;
    flap.addEventListener("mousedown", () => {
      isDragging = true;
      flap.style.transition = "none";
    })
    document.body.addEventListener("mousemove", (e) => {
      if (isDragging) {
        e.preventDefault();
        let pt = coords(e);
        pct = progress01(pt.x, 1000, 200);
        let ang = transition(pct, 0, -180);
        let z = this.flaps.length;
        flap.style.transform = `translate3d(${0}px,0,${z*5}px) rotateY(${ang}deg)`;
      }
    });
    document.body.addEventListener("mouseup", (e) => {
      if (isDragging) {
        isDragging = false;
        flap.style.transition = "";
        if (pct > 0.5) this.setLeaf(this.currentLeaf);
        else this.setLeaf(this.currentLeaf+1);
      }
    });
  }
}

let transition = (pct, a, b) => a + pct * (b-a);
let clamp = (val, min, max) => val <= min ? min : val >= max ? max : val;
let progress = (val, a, b) => (val - a)/(b-a);
let progress01 = (val, a, b) => clamp(progress(val, a, b), 0, 1);
let coords = (e) => {
  return ( (e = e.touches && e.touches[0] || e), ({ x:e.pageX, y:e.pageY }) );
}


export default Viewer;
