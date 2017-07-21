import h from 'hyperscript';
import convertUnits from '../utils/convertUnits';

require('./controls.css');


const select = function (...arg) {
  return h('select', ...arg);
};
const option = function (...arg) {
  return h('option', ...arg);
};
const inputNumber = function (val) {
  return h('input', { type: 'number', value: val });
};
const btn = function (...arg) {
  return h('button.bindery-btn', ...arg);
};
const btnMini = function (...arg) {
  return h('button.bindery-btn.bindery-btn-mini', ...arg);
};
const btnMain = function (...arg) {
  return h('button.bindery-btn.bindery-btn-main', ...arg);
};
const toggleSwitch = () => h('.bindery-switch', h('.bindery-switch-handle'));
const switchRow = function (...arg) {
  return h('.bindery-toggle', ...arg, toggleSwitch);
};
const row = function (...arg) {
  return h('.bindery-toggle', ...arg);
};
const label = function (...arg) {
  return h('.bindery-label', ...arg);
};


class Controls {
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

    const input = {
      top: inputNumber(this.binder.pageMargin.top),
      inner: inputNumber(this.binder.pageMargin.inner),
      outer: inputNumber(this.binder.pageMargin.outer),
      bottom: inputNumber(this.binder.pageMargin.bottom),
      width: inputNumber(this.binder.pageSize.width),
      height: inputNumber(this.binder.pageSize.height),
    };

    const sizeControl = h('.bindery-val.bindery-size',
      h('div', 'W', input.width),
      h('div', 'H', input.height),
    );

    const changeUnit = (newUnit) => {
      const oldUnit = this.binder.pageUnit;
      Object.values(input).forEach((inputEl) => {
        const el = inputEl;
        const newVal = convertUnits(parseFloat(el.value), oldUnit, newUnit);
        const rounded = Math.round(newVal * 100) / 100;
        el.value = rounded;
      });
      this.binder.pageUnit = newUnit;
    };

    const unitSelect = select(
      { onchange() {
        changeUnit(this.value);
      } },
      option({ value: 'px' }, 'Pixels'),
      option({ disabled: true }, '96px = 1 in'),
      option({ disabled: true }, ''),
      option({ value: 'pt' }, 'Points'),
      option({ disabled: true }, '72pt = 1 in'),
      option({ disabled: true }, ''),
      option({ value: 'pc' }, 'Pica'),
      option({ disabled: true }, '6pc = 72pt = 1in'),
      option({ disabled: true }, ''),
      option({ value: 'in' }, 'Inches'),
      option({ disabled: true }, '1in = 96px'),
      option({ disabled: true }, ''),
      option({ value: 'cm' }, 'cm'),
      option({ disabled: true }, '2.54cm = 1in'),
      option({ disabled: true }, ''),
      option({ value: 'mm' }, 'mm'),
      option({ disabled: true }, '25.4mm = 1in'),
    );

    unitSelect.value = this.binder.pageUnit;
    const unitSwitch = row('Units', unitSelect);

    const marginPreview = h('.preview');
    const marginControl = h('.bindery-val.bindery-margin',
      h('.top', input.top),
      h('.inner', input.inner),
      h('.outer', input.outer),
      h('.bottom', input.bottom),
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

    const perSheet = row('Pages per Sheet', select(
      option('1'),
      option('2'),
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
      const BASE = 80;
      let ratio = newSize.width / newSize.height;
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
      const t = (newMargin.top / newSize.height) * height;
      const b = (newMargin.bottom / newSize.height) * height;
      const o = (newMargin.outer / newSize.width) * width;
      const i = (newMargin.inner / newSize.width) * width;

      sizeControl.style.width = `${width}px`;
      sizeControl.style.height = `${height}px`;
      marginControl.style.width = `${width}px`;
      marginControl.style.height = `${height}px`;

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
        top: input.top.value,
        inner: input.inner.value,
        outer: input.outer.value,
        bottom: input.bottom.value,
      };
      const newSize = {
        height: input.height.value,
        width: input.width.value,
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

    Object.keys(input).forEach((k) => {
      input[k].addEventListener('change', throttledUpdate);
      input[k].addEventListener('keyup', throttledUpdate);
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

        label(layoutState, 'Pagination'),
        layoutControl,
        unitSwitch,
        facingToggle,

        label('Print'),
        paperSize,
        perSheet,
        orientation,

        label('View'),
        guidesToggle,

        viewSwitcher,
      )
    );
  }

}

export default Controls;
