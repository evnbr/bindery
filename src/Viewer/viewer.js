import css from "style!css!./viewer.css";

import Page from "../Page/page";
import h from "hyperscript";

class Printer {
  constructor(opts) {
    this.pages = opts.pages;

    if (opts.target) {
      this.target = opts.target;
    }
    else {
      this.target = h("div");
      document.body.appendChild(this.target);
    }
    this.target.setAttribute("bindery-export", true);

    this.printWrapper = h("div.bindery-print-wrapper", {
      style: `height:${Page.H}px; width:${Page.W * 2}px`,
    });

    this.doubleSided = true;
    this.currentLeaf = 0;
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    document.body.classList.remove("bindery-viewing");
    this.target.parentNode.removeChild(this.target);
  }
  toggleGuides() {
    this.target.classList.toggle("bindery-show-guides");
  }
  toggleDouble() {
    this.doubleSided = !this.doubleSided;
    this.update();
  }
  setGrid() {
    this.mode = "grid";
    this.update();
  }
  toggleInteractive() {
    this.mode = this.mode == "grid" ? "preview" : "grid";
    this.update();
  }
  update() {
    document.body.classList.add("bindery-viewing");
    switch (this.mode) {
      case "grid":
        this.renderGrid();
        break;
      case "preview":
        this.renderPreview();
        break;
      default:
        this.renderGrid();
    }
  }
  renderGrid() {
    this.mode = "grid";
    this.target.style.display = "block";
    this.target.innerHTML = "";

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
      let wrap = this.printWrapper.cloneNode(false);

      if (this.doubleSided) {
        let l = pages[i].element;
        let r = pages[i+1].element;
        l.setAttribute("bindery-side", "left");
        r.setAttribute("bindery-side", "right");
        wrap.appendChild(l);
        wrap.appendChild(r);
      }
      else {
        let pg = pages[i].element;
        pg.setAttribute("bindery-side", "right");
        wrap.appendChild(pg);
      }
      this.target.appendChild(wrap);
    }
  }
  renderPreview() {
    this.mode = "preview";
    this.target.style.display = "block";
    this.target.innerHTML = "";
    this.flaps = [];

    let pages = this.pages.slice();

    if (this.doubleSided) {
      if (this.pages.length % 2 !== 0) {
        let pg = new Page();
        this.book.addPage(pg);
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
        // this.setLeaf(li-1);
        },
      });
      this.makeDraggable(flap);
      this.target.classList.add("bindery-stage3d");
      this.flaps.push(flap);

      let l = pages[i].element;
      l.classList.add("bindery-page3d-front");
      flap.appendChild(l);
      if (this.doubleSided) {
        flap.classList.add("bindery-doubleSided");
        let r = pages[i+1].element;
        r.classList.add("bindery-page3d-back");
        flap.appendChild(r);
      }
      else {
        let r = h(".bindery-page.bindery-page3d-back")
        flap.appendChild(r);
      }
      // flap.style.zIndex = `${this.pages.length - i}`;
      // flap.style.top = `${i * 4}px`;
      flap.style.left = `${i * 4}px`;
      this.target.appendChild(flap);
    }
    this.setLeaf(0);
  }
  setLeaf(n) {
    this.currentLeaf = n;
    this.flaps.forEach((flap, i) => {
      let z = this.flaps.length - Math.abs(i - n);
      flap.style.transform = `translate3d(${(i < n) ? 4 : 0}px,0,${z*5}px) rotateY(${(i < n) ? -180 : 0}deg)`;
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


export default Printer;
