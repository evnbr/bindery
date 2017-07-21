import h from 'hyperscript';

import Page from '../Page/page';
import errorView from './error';

require('./viewer.css');

class Viewer {
  constructor() {
    this.pages = [];

    this.doubleSided = true;
    this.twoUp = false;

    this.mode = 'grid';
    this.currentLeaf = 0;

    this.export = h('.bindery-export');
    this.export.setAttribute('bindery-export', true);

    // Automatically switch into print mode
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener((mql) => {
        if (mql.matches) {
          this.setPrint();
        } else {
              // after print
        }
      });
    }
  }
  displayError(title, text) {
    if (!this.export.parentNode) {
      document.body.appendChild(this.export);
    }
    if (!this.error) {
      this.export.innerHTML = '';
      this.error = errorView(title, text);
      this.export.appendChild(this.error);
    }
  }
  cancel() {
    // TODO this doesn't work if the target is an existing node
    if (this.export.parentNode) {
      this.export.parentNode.removeChild(this.export);
    }
  }
  toggleGuides() {
    this.export.classList.toggle('bindery-show-guides');
  }
  toggleBleed() {
    this.export.classList.add('bindery-show-bleed');
  }
  toggleDouble() {
    this.doubleSided = !this.doubleSided;
    this.update();
  }
  setMode(newMode) {
    switch (newMode) {
    case 'grid':
    case 'standard':
    case 'default':
      this.mode = 'grid';
      break;
    case 'interactive':
    case 'preview':
    case '3d':
      this.mode = 'interactive';
      break;
    case 'print':
      this.mode = 'print';
      break;
    default:
      console.error(`Bindery: Unknown view mode "${newMode}"`);
      break;
    }
  }
  setGrid() {
    this.mode = 'grid';
    this.update();
  }
  setPrint() {
    this.mode = 'print';
    this.update();
  }
  setInteractive() {
    this.mode = 'interactive';
    this.export.classList.remove('bindery-show-bleed');
    this.update();
  }
  update() {
    if (!this.export.parentNode) {
      document.body.appendChild(this.export);
    }

    document.body.classList.add('bindery-viewing');

    if (this.mode === 'grid') {
      this.renderGrid();
    } else if (this.mode === 'interactive') {
      this.renderInteractive();
    } else if (this.mode === 'print') {
      this.renderPrint();
    } else {
      this.renderGrid();
    }
  }

  renderPrint() {
    this.mode = 'print';
    this.export.style.display = 'block';
    this.export.classList.add('bindery-show-bleed');

    this.export.innerHTML = '';

    const pages = this.pages.slice();

    if (this.twoUp) {
      if (this.pages.length % 2 !== 0) {
        const pg = new Page();
        pages.push(pg);
      }
      const spacerPage = new Page();
      const spacerPage2 = new Page();
      spacerPage.element.style.visibility = 'hidden';
      spacerPage2.element.style.visibility = 'hidden';
      pages.unshift(spacerPage);
      pages.push(spacerPage2);
    }

    for (let i = 0; i < pages.length; i += (this.twoUp ? 2 : 1)) {
      if (this.twoUp) {
        const left = pages[i];
        const right = pages[i + 1];

        const leftPage = left.element;
        const rightPage = right.element;

        const wrap = h('.bindery-print-page',
          h('.bindery-spread-wrapper', {
            style: Page.spreadSizeStyle(),
          }, leftPage, rightPage)
        );

        this.export.appendChild(wrap);
      } else {
        const pg = pages[i].element;
        const wrap = h('.bindery-print-page',
          h('.bindery-spread-wrapper', {
            style: Page.sizeStyle(),
          }, pg),
        );
        this.export.appendChild(wrap);
      }
    }
  }

  renderGrid() {
    this.mode = 'grid';
    this.export.style.display = 'block';
    this.export.classList.remove('bindery-show-bleed');

    this.export.innerHTML = '';

    const pages = this.pages.slice();

    if (this.doubleSided) {
      if (this.pages.length % 2 !== 0) {
        const pg = new Page();
        pages.push(pg);
      }
      const spacerPage = new Page();
      const spacerPage2 = new Page();
      spacerPage.element.style.visibility = 'hidden';
      spacerPage2.element.style.visibility = 'hidden';
      pages.unshift(spacerPage);
      pages.push(spacerPage2);
    }


    for (let i = 0; i < pages.length; i += (this.doubleSided ? 2 : 1)) {
      if (this.doubleSided) {
        const left = pages[i];
        const right = pages[i + 1];

        const leftPage = left.element;
        const rightPage = right.element;


        const wrap = h('.bindery-spread-wrapper', {
          style: Page.spreadSizeStyle(),
        }, leftPage, rightPage
        );

        this.export.appendChild(wrap);
      } else {
        const pg = pages[i].element;
        pg.setAttribute('bindery-side', 'right');
        const wrap = h('.bindery-print-page',
          h('.bindery-spread-wrapper', {
            style: Page.sizeStyle(),
          }, pg),
        );
        this.export.appendChild(wrap);
      }
    }
  }
  renderInteractive() {
    this.mode = 'interactive';
    this.export.style.display = 'block';
    this.export.innerHTML = '';
    this.flaps = [];
    this.export.classList.remove('bindery-show-bleed');

    const pages = this.pages.slice();

    if (this.doubleSided) {
      if (this.pages.length % 2 !== 0) {
        const pg = new Page();
        pages.push(pg);
      }
    }
    const spacerPage = new Page();
    const spacerPage2 = new Page();
    spacerPage.element.style.visibility = 'hidden';
    spacerPage2.element.style.visibility = 'hidden';
    pages.unshift(spacerPage);
    pages.push(spacerPage2);

    let leafIndex = 0;
    for (let i = 1; i < pages.length - 1; i += (this.doubleSided ? 2 : 1)) {
      leafIndex += 1;
      const li = leafIndex;
      const flap = h('div.bindery-page3d', {
        style: Page.sizeStyle(),
        onclick: () => {
          let newLeaf = li - 1;
          if (newLeaf === this.currentLeaf) newLeaf += 1;
          this.setLeaf(newLeaf);
        },
      });
      // this.makeDraggable(flap);
      this.export.classList.add('bindery-stage3d');
      this.flaps.push(flap);


      const rightPage = pages[i].element;
      let leftPage;
      rightPage.classList.add('bindery-page3d-front');
      flap.appendChild(rightPage);
      if (this.doubleSided) {
        flap.classList.add('bindery-doubleSided');
        leftPage = pages[i + 1].element;
        leftPage.classList.add('bindery-page3d-back');
        flap.appendChild(leftPage);
      } else {
        leftPage = h('.bindery-page.bindery-page3d-back', {
          style: Page.sizeStyle(),
        });
        flap.appendChild(leftPage);
      }
      // TODO: Dynamically add/remove pages.
      // Putting 1000s of elements onscreen
      // locks up the browser.
      // if (i > 200) {
      //   rightPage.style.display = 'none';
      //   leftPage.style.display = 'none';
      //   flap.style.background = '#ddd';
      // }


      let leftOffset = 4;
      if (pages.length * leftOffset > 300) leftOffset = 300 / pages.length;

      flap.style.left = `${i * leftOffset}px`;

      this.export.appendChild(flap);
    }
    if (this.currentLeaf) {
      this.setLeaf(this.currentLeaf);
    } else {
      this.setLeaf(0);
    }
  }
  setLeaf(n) {
    this.currentLeaf = n;
    let zScale = 4;
    if (this.flaps.length * zScale > 200) zScale = 200 / this.flaps.length;

    this.flaps.forEach((flap, i, arr) => {
      // + 0.5 so left and right are even
      const z = (arr.length - Math.abs((i - n) + 0.5)) * zScale;
      flap.style.transform = `translate3d(${(i < n) ? 4 : 0}px,0,${z}px) rotateY(${(i < n) ? -180 : 0}deg)`;
    });
  }
  // makeDraggable(flap) {
  //   let isDragging = false;
  //   let pct = 0;
  //   flap.addEventListener('mousedown', () => {
  //     isDragging = true;
  //     flap.style.transition = 'none';
  //   });
  //   document.body.addEventListener('mousemove', (e) => {
  //     if (isDragging) {
  //       e.preventDefault();
  //       const pt = coords(e);
  //       pct = progress01(pt.x, 1000, 200);
  //       const ang = transition(pct, 0, -180);
  //       const z = this.flaps.length;
  //       flap.style.transform = `translate3d(${0}px,0,${z * 5}px) rotateY(${ang}deg)`;
  //     }
  //   });
  //   document.body.addEventListener('mouseup', (e) => {
  //     if (isDragging) {
  //       isDragging = false;
  //       flap.style.transition = '';
  //       if (pct > 0.5) this.setLeaf(this.currentLeaf);
  //       else this.setLeaf(this.currentLeaf + 1);
  //     }
  //   });
  // }
}

// const transition = (pct, a, b) => a + (pct * (b - a));
// const clamp = (val, min, max) => {
//   return (((val <= min) ? min : val) >= max) ? max : val;
// };
// const progress = (val, a, b) => (val - a) / (b - a);
// const progress01 = (val, a, b) => clamp(progress(val, a, b), 0, 1);
// const coords = (e) => ((e = e.touches && e.touches[0] || e), ({ x: e.pageX, y: e.pageY }));


export default Viewer;
