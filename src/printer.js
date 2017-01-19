import Page from "./page";
import h from "hyperscript";

class Printer {
  constructor(opts) {
    this.book = opts.book;

    if (opts.target) {
      this.target = opts.target;
      this.target.setAttribute("bindery-export", true);
    }
    else {
      this.target = el("div", {"bindery-export": true});
      document.body.appendChild(this.target);
    }

    this.template = opts.template;
    this.printWrapper = h("div.bindery-print-wrapper");
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    this.target.parentNode.removeChild(this.target);
  }
  toggleGuides() {
    this.target.classList.toggle("bindery-show-guides");
  }
  setOrdered() {
    this.target.style.display = "block";
    this.target.innerHTML = "";

    if (this.book.pages.length % 2 !== 0) {
      let pg = new Page(this.template);
      this.book.addPage(pg);
    }
    if (!(this.book.pages[0].element.style.visibility == "hidden")) {
      let spacerPage = new Page(this.template);
      let spacerPage2 = new Page(this.template);
      spacerPage.element.style.visibility = "hidden";
      spacerPage2.element.style.visibility = "hidden";
      this.book.pages.unshift(spacerPage);
      this.book.pages.push(spacerPage2);
    }

    for (var i = 0; i < this.book.pages.length; i += 2) {
      let wrap = this.printWrapper.cloneNode(false);
      let l = this.book.pages[i].element;
      let r = this.book.pages[i+1].element;
      l.setAttribute("bindery-left", true);
      r.setAttribute("bindery-right", true);
      wrap.appendChild(l);
      wrap.appendChild(r);
      this.target.appendChild(wrap);
    }
  }
  setInteractive() {
    this.target.style.display = "block";
    this.target.innerHTML = "";
    this.flaps = [];

    if (this.book.pages.length % 2 !== 0) {
      let pg = new Page(this.template);
      this.book.addPage(pg);
    }
    if (!(this.book.pages[0].element.style.visibility == "hidden")) {
      let spacerPage = new Page(this.template);
      let spacerPage2 = new Page(this.template);
      spacerPage.element.style.visibility = "hidden";
      spacerPage2.element.style.visibility = "hidden";
      this.book.pages.unshift(spacerPage);
      this.book.pages.push(spacerPage2);
    }

    let leafIndex = 0;
    for (let i = 1; i < this.book.pages.length - 1; i += 2) {
      leafIndex++;
      let li = leafIndex;
      let flap = h("div.bindery-page3d", {onclick: () => {
        this.setLeaf(li-1);
      }});
      this.target.classList.add("bindery-stage3d");
      this.flaps.push(flap);

      let l = this.book.pages[i].element;
      let r = this.book.pages[i+1].element;
      l.classList.add("bindery-page3d-front");
      r.classList.add("bindery-page3d-back");
      flap.appendChild(l);
      flap.appendChild(r);
      // flap.style.zIndex = `${this.book.pages.length - i}`;
      // flap.style.top = `${i * 4}px`;
      flap.style.left = `${i * 4}px`;
      this.target.appendChild(flap);
    }
    this.setLeaf(0);
  }
  setLeaf(n) {
    this.flaps.forEach((flap, i) => {
      let z = this.flaps.length - Math.abs(i - n);
      if (i < n) {
        flap.style.transform = `translate3d(0,0,${z*5}px) rotateY(${-180}deg)`;
      }
      else {
        flap.style.transform = `translate3d(0,0,${z*5}px) rotateY(${0}deg)`;
      }

    });
  }
}

export default Printer;
