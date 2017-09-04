import h from 'hyperscript';
import { convertStrToPx } from '../utils/convertUnits';
import c from '../utils/prefixClass';

import {
  title,
  select,
  option,
  btn,
  btnMain,
  btnLight,
  switchRow,
  row,
  viewMode,
  expandRow,
  expandArea,
  inputNumberUnits,
} from './components';

class Controls {
  constructor(opts) {
    this.binder = opts.binder;
    const viewer = opts.viewer;

    const done = () => {
      this.binder.cancel();
    };
    const print = () => {
      viewer.setPrint();
      window.print();
    };

    const printBtn = btnMain({ onclick: print }, 'Print');

    let cropToggle;
    let bleedMarkToggle;

    const toggleCropMarks = () => {
      viewer.isShowingCropMarks = !viewer.isShowingCropMarks;
      cropToggle.classList.toggle('selected');
    };

    const toggleBleedMarks = () => {
      viewer.isShowingBleedMarks = !viewer.isShowingBleedMarks;
      bleedMarkToggle.classList.toggle('selected');
    };

    cropToggle = switchRow({ onclick: toggleCropMarks }, 'Crop Marks');
    cropToggle.classList.add('selected');
    bleedMarkToggle = switchRow({ onclick: toggleBleedMarks }, 'Bleed Marks');

    let doneBtn = '';
    if (!this.binder.autorun) {
      doneBtn = btn({ onclick: done }, 'Done');
    }

    const s = this.binder.styler;
    const unitInputs = {
      top: inputNumberUnits(s.margin.top),
      inner: inputNumberUnits(s.margin.inner),
      outer: inputNumberUnits(s.margin.outer),
      bottom: inputNumberUnits(s.margin.bottom),
      width: inputNumberUnits(s.size.width),
      height: inputNumberUnits(s.size.height),
      bleed: inputNumberUnits(s.bleed),
    };

    const sizeControl = h(`.${c('row')}.${c('size')}`,
      h('div', 'W', unitInputs.width),
      h('div', 'H', unitInputs.height),
    );

    const marginPreview = h(c('.preview'));
    const marginControl = h(`.${c('row')}.${c('margin')}`,
      h('.top', unitInputs.top),
      h('.inner', unitInputs.inner),
      h('.outer', unitInputs.outer),
      h('.bottom', unitInputs.bottom),
      marginPreview,
    );

    const layoutControl = h(c('.layout-control'),
      sizeControl,
      marginControl
    );

    const bleedAmount = row('Bleed Amount', unitInputs.bleed);


    // const paperSize = row('Paper Size', select(
    //   option('Letter'),
    //   option({ disabled: true }, '8.5 x 11'),
    //   option({ disabled: true }, ''),
    //   option({ disabled: true }, 'Legal'),
    //   option({ disabled: true }, '8.5 x 14'),
    //   option({ disabled: true }, ''),
    //   option({ disabled: true }, 'Tabloid'),
    //   option({ disabled: true }, '11 x 17'),
    //   option({ disabled: true }, ''),
    //   option({ disabled: true }, 'A4'),
    //   option({ disabled: true }, 'mm x mm'),
    // ));

    const arrangeSelect = select(
      option({ value: 'arrange_one' }, 'Pages'),
      option({ value: 'arrange_two', selected: true }, 'Spreads'),
      option({ value: 'arrange_booklet' }, 'Booklet'),
      option({ disabled: true }, 'Grid'),
      option({ disabled: true }, 'Signatures'),
    );
    arrangeSelect.addEventListener('change', () => {
      viewer.setPrintArrange(arrangeSelect.value);
    });
    const arrangement = row('Sheet Layout', arrangeSelect);

    // const orientationSelect = select(
    //   option({ value: 'landscape' }, 'Landscape'),
    //   option({ value: 'portrait' }, 'Portrait'),
    // );
    // orientationSelect.addEventListener('change', () => {
    //   viewer.setOrientation(orientationSelect.value);
    // });
    // const orientation = row('Orientation', orientationSelect);

    const validCheck = h('div', { style: {
      display: 'none',
      color: '#e2b200',
    } }, 'Too Small');
    const inProgress = btnLight({ style: {
      display: 'none',
      'pointer-events': 'none',
    } }, 'Updating...');


    const startPaginating = () => {
      inProgress.style.display = '';
      refreshPaginationBtn.style.display = 'none';
      refreshPaginationBtnDebug.style.display = 'none';
      this.binder.makeBook(() => {
        inProgress.style.display = 'none';
        refreshPaginationBtn.style.display = '';
        refreshPaginationBtnDebug.style.display = '';
      });
    }
    const refreshPaginationBtn = btn({ onclick: () => {
      this.binder.debug = false;
      startPaginating();
    } }, 'Update Pagination');

    const viewModes = [
      viewMode('grid', viewer.setGrid, 'Preview'),
      viewMode('outline', viewer.setOutline, 'Outline'),
      viewMode('flip', viewer.setFlip, 'Flip'),
      viewMode('print', viewer.setPrint, 'Sheet'),
    ];

    const viewSwitcher = h(c('.viewswitcher'), ...viewModes);

    const headerContent = h('span', 'Loading');
    const header = title(h(c('.spinner')), headerContent);

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

      marginPreview.style.top = `${t}px`;
      marginPreview.style.bottom = `${b}px`;
      marginPreview.style.left = `${i}px`;
      marginPreview.style.right = `${o}px`;
    };
    updateLayoutPreview(this.binder.styler.size, this.binder.styler.margin);

    this.setInProgress = () => {
      headerContent.textContent = 'Paginating';
      validCheck.style.display = 'none';
      inProgress.style.display = '';
      refreshPaginationBtn.style.display = 'none';
    };

    this.updateProgress = (count) => {
      headerContent.textContent = `${count} Pages`;
    };

    this.setDone = () => {
      headerContent.textContent = `${viewer.book.pages.length} Pages`;
      inProgress.style.display = 'none';
      refreshPaginationBtn.style.display = '';
      validCheck.style.display = 'none';
    };

    this.setInvalid = () => {
      validCheck.style.display = '';
      refreshPaginationBtn.style.display = '';
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
      const newBleed = unitInputs.bleed.value;

      const needsUpdate =
        Object.keys(newMargin).some(k => this.binder.styler.margin[k] !== newMargin[k])
        || Object.keys(newSize).some(k => this.binder.styler.size[k] !== newSize[k])
        || this.binder.styler.bleed !== newBleed;

      if (needsUpdate) {
        updateLayoutPreview(newSize, newMargin);
        this.binder.styler.setSize(newSize);
        this.binder.styler.setMargin(newMargin);
        this.binder.styler.setBleed(newBleed);
        this.binder.styler.updateStylesheet();
        viewer.updateZoom();

        if (this.binder.autoupdate) {
          if (this.binder.styler.isSizeValid()) {
            this.binder.makeBook();
          } else {
            this.setInvalid();
          }
        }
      }
    };

    let updateDelay;
    const throttledUpdate = () => {
      clearTimeout(updateDelay);
      updateDelay = setTimeout(updateLayout, 100);
    };

    Object.keys(unitInputs).forEach((k) => {
      unitInputs[k].addEventListener('change', throttledUpdate);
      unitInputs[k].addEventListener('keyup', throttledUpdate);
    });

    let playSlow;
    const step = btn('→', {
      style: { display: 'none' },
      onclick: () => window.binderyDebug.step(),
    });
    const pause = btn('❙❙', {
      onclick: () => {
        window.binderyDebug.pause();
        pause.style.display = 'none';
        playSlow.style.display = '';
        step.style.display = '';
      },
    });
    playSlow = btn('▶️', {
      style: { display: 'none' },
      onclick: () => {
        window.binderyDebug.resume();
        playSlow.style.display = 'none';
        pause.style.display = '';
        step.style.display = 'none';
      },
    });
    const debugDone = btn('Done', {
      onclick: () => {
        window.binderyDebug.finish();
      },
    });
    const refreshPaginationBtnDebug = btnLight('Debug', {
      onclick: () => {
        playSlow.style.display = 'none';
        step.style.display = 'none';
        pause.style.display = '';
        this.binder.debug = true;
        startPaginating();
      },
    });

    const debugControls = row(
      pause,
      playSlow,
      step,
      debugDone,
    );
    debugControls.classList.add(c('debug-controls'));
    printBtn.classList.add(c('btn-print'));

    const layoutState = h('div',
      refreshPaginationBtn,
      refreshPaginationBtnDebug,
      validCheck,
      inProgress,
    );

    this.element = h(c('.controls'),
      header,
      viewSwitcher,

      // expandRow('⚙️'),
      // expandArea(
        arrangement,
        // paperSize,
        // orientation,

        expandRow('Marks and Bleed'),
        expandArea(
          cropToggle,
          bleedMarkToggle,
          bleedAmount,
        ),

        expandRow('Book Setup'),
        expandArea(
          layoutControl,
          row(layoutState),
        ),
      // ),

      debugControls,

      row(doneBtn, printBtn),
    );
  }

}

export default Controls;
