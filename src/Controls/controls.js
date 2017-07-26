import h from 'hyperscript';
import { convertStrToPx } from '../utils/convertUnits';
import {
  select,
  option,
  btn,
  btnMain,
  btnMini,
  switchRow,
  row,
  heading,
  inputNumberUnits,
} from './components';

require('./controls.css');

class ControlPanel {
  constructor(opts) {
    this.holder = h('div.bindery-controls');
    document.body.appendChild(this.holder);

    this.binder = opts.binder;

    const done = () => {
      this.binder.cancel();
    };
    const print = () => {
      this.binder.viewer.setPrint();
      window.print();
    };

    const printBtn = btnMain({ onclick: print }, 'Print');

    let layoutControl;
    let guidesToggle;
    let facingToggle;

    const toggleGuides = () => {
      guidesToggle.classList.toggle('selected');
      this.binder.viewer.toggleGuides();
    };
    guidesToggle = switchRow({ onclick: toggleGuides }, 'Show Bounds');

    const toggleFacing = () => {
      facingToggle.classList.toggle('selected');
      layoutControl.classList.toggle('not-facing');
      this.binder.viewer.toggleDouble();
    };
    facingToggle = switchRow({ onclick: toggleFacing }, 'Facing Pages');
    facingToggle.classList.add('selected');

    let doneBtn = '';
    if (!this.binder.runImmeditately) {
      doneBtn = btn({ onclick: done }, 'Done');
    }

    const unitInputs = {
      top: inputNumberUnits(this.binder.pageMargin.top),
      inner: inputNumberUnits(this.binder.pageMargin.inner),
      outer: inputNumberUnits(this.binder.pageMargin.outer),
      bottom: inputNumberUnits(this.binder.pageMargin.bottom),
      width: inputNumberUnits(this.binder.pageSize.width),
      height: inputNumberUnits(this.binder.pageSize.height),
    };

    const sizeControl = h('.bindery-val.bindery-size',
      h('div', 'W', unitInputs.width),
      h('div', 'H', unitInputs.height),
    );

    const marginPreview = h('.preview');
    const marginControl = h('.bindery-val.bindery-margin',
      h('.top', unitInputs.top),
      h('.inner', unitInputs.inner),
      h('.outer', unitInputs.outer),
      h('.bottom', unitInputs.bottom),
      marginPreview,
    );

    layoutControl = h('.bindery-layout-control',
      sizeControl,
      marginControl
    );

    const paperSize = row('Paper Size', select(
      option('Letter'),
      option({ disabled: true }, '8.5 x 11'),
      option({ disabled: true }, ''),
      option('Legal'),
      option({ disabled: true }, '8.5 x 14'),
      option({ disabled: true }, ''),
      option('Tabloid'),
      option({ disabled: true }, '11 x 17'),
      option({ disabled: true }, ''),
      option('A4'),
      option({ disabled: true }, 'mm x mm'),
    ));

    const arrangement = row('Arrange', select(
      option('1 up'),
      option('2 up'),
      option('8 up'),
      option('Booklet'),
      option('Signatures'),
    ));

    const orientation = row('Orientation', select(
      option('Landscape'),
      option('Portrait'),
    ));

    const validCheck = h('div', { style: {
      display: 'none',
      color: '#e2b200',
    } }, 'Too Small');
    const inProgress = h('div', { style: {
      display: 'none',
    } }, 'Updating...');
    const forceRefresh = btnMini({ onclick: () => {
      inProgress.style.display = 'block';
      forceRefresh.style.display = 'none';
      setTimeout(() => {
        this.binder.makeBook(() => {
          inProgress.style.display = 'none';
          forceRefresh.style.display = 'block';
        }, 100);
      });
    } }, 'Update');


    let gridMode;
    let printMode;
    let interactMode;
    const setGrid = () => {
      gridMode.classList.add('selected');
      interactMode.classList.remove('selected');
      printMode.classList.remove('selected');

      this.binder.viewer.setGrid();
    };
    const setInteractive = () => {
      gridMode.classList.remove('selected');
      interactMode.classList.add('selected');
      printMode.classList.remove('selected');

      this.binder.viewer.setInteractive();
    };
    const setPrint = () => {
      gridMode.classList.remove('selected');
      interactMode.classList.remove('selected');
      printMode.classList.add('selected');

      this.binder.viewer.setPrint();
    };
    gridMode = h('.bindery-viewmode.grid', { onclick: setGrid }, h('.icon'), 'Grid');
    interactMode = h('.bindery-viewmode.interactive', { onclick: setInteractive }, h('.icon'), 'Interactive');
    printMode = h('.bindery-viewmode.print', { onclick: setPrint }, h('.icon'), 'Sheet');
    if (this.binder.viewer.mode === 'grid') gridMode.classList.add('selected');
    if (this.binder.viewer.mode === 'interactive') interactMode.classList.add('selected');
    if (this.binder.viewer.mode === 'print') printMode.classList.add('selected');
    const viewSwitcher = h('.bindery-viewswitcher',
      gridMode, printMode, interactMode,
    );

    const header = h('div', { style: {
      padding: '20px',
      'font-size': '20px',
    } }, 'Bindery');

    const updateLayoutPreview = (newSize, newMargin) => {
      const px = {
        top: convertStrToPx(newMargin.top),
        inner: convertStrToPx(newMargin.inner),
        outer: convertStrToPx(newMargin.outer),
        bottom: convertStrToPx(newMargin.bottom),
        width: convertStrToPx(newSize.width),
        height: convertStrToPx(newSize.height),
      };

      const BASE = 90;
      let ratio = px.width / px.height;
      ratio = Math.max(ratio, 0.6);
      ratio = Math.min(ratio, 1.8);

      let width;
      let height;
      if (ratio > 2) {
        width = BASE * ratio;
        height = BASE;
      } else {
        width = BASE;
        height = (BASE * 1) / ratio;
      }

      const t = (px.top / px.height) * height;
      const b = (px.bottom / px.height) * height;
      const o = (px.outer / px.width) * width;
      const i = (px.inner / px.width) * width;

      sizeControl.style.width = `${width}px`;
      sizeControl.style.height = `${height}px`;
      marginControl.style.width = `${width}px`;
      marginControl.style.height = `${height}px`;

      console.log(t);
      marginPreview.style.top = `${t}px`;
      marginPreview.style.bottom = `${b}px`;
      marginPreview.style.left = `${i}px`;
      marginPreview.style.right = `${o}px`;
    };
    updateLayoutPreview(this.binder.pageSize, this.binder.pageMargin);

    this.setInProgress = () => {
      header.innerText = 'Paginating...';
      validCheck.style.display = 'none';
      inProgress.style.display = 'block';
      forceRefresh.style.display = 'none';
    };

    this.updateProgress = (count) => {
      header.innerText = `${count} Pages`;
    };

    this.setDone = () => {
      header.innerText = `${this.binder.viewer.pages.length} Pages`;
      inProgress.style.display = 'none';
      forceRefresh.style.display = 'block';
      validCheck.style.display = 'none';
    };

    this.setInvalid = () => {
      validCheck.style.display = 'block';
      forceRefresh.style.display = 'none';
      inProgress.style.display = 'none';
    };

    const updateLayout = () => {
      const newMargin = {
        top: unitInputs.top.value,
        inner: unitInputs.inner.value,
        outer: unitInputs.outer.value,
        bottom: unitInputs.bottom.value,
      };
      const newSize = {
        height: unitInputs.height.value,
        width: unitInputs.width.value,
      };

      let needsUpdate = false;
      Object.keys(newMargin).forEach((k) => {
        if (this.binder.pageMargin[k] !== newMargin[k]) { needsUpdate = true; }
      });
      Object.keys(newSize).forEach((k) => {
        if (this.binder.pageSize[k] !== newSize[k]) { needsUpdate = true; }
      });

      if (needsUpdate) {
        updateLayoutPreview(newSize, newMargin);
        this.binder.setSize(newSize);
        this.binder.setMargin(newMargin);

        if (this.binder.isSizeValid()) {
          this.binder.makeBook();
        } else {
          this.setInvalid();
        }
      }
    };

    let updateDelay;
    const throttledUpdate = () => {
      clearTimeout(updateDelay);
      updateDelay = setTimeout(updateLayout, 700);
    };

    Object.keys(unitInputs).forEach((k) => {
      unitInputs[k].addEventListener('change', throttledUpdate);
      unitInputs[k].addEventListener('keyup', throttledUpdate);
    });

    const layoutState = h('div',
      { style: { float: 'right' } },
      forceRefresh,
      validCheck,
      inProgress,
    );

    this.holder.appendChild(h('div', {},
        header,
        doneBtn,
        printBtn,

        heading(layoutState, 'Pagination'),
        layoutControl,
        facingToggle,

        heading('Print'),
        paperSize,
        orientation,
        arrangement,

        heading('View'),
        guidesToggle,

        viewSwitcher,
      )
    );
  }

}

export default ControlPanel;
