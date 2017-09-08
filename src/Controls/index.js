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

    const doneBtn = btn({ onclick: () => {
      if (this.binder.autorun) {
        window.history.back();
      } else {
        this.binder.cancel();
      }
    } }, 'Done');

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


    const sizePageOption = option({ disabled: true }, 'Page');
    const sizePageBleedOption = option({ disabled: true }, 'Page + Bleed');
    const sizePageMarkOption = option({ disabled: true }, 'Page + Bleed + Marks');

    const sheetSizeSelect = select(
      option({ value: 'size_page', selected: true }, 'Page'),
      sizePageOption,
      option({ disabled: true }, ''),
      option({ value: 'size_page_bleed' }, 'Page + Bleed'),
      sizePageBleedOption,
      option({ disabled: true }, ''),
      option({ value: 'size_page_marks' }, 'Page + Marks'),
      sizePageMarkOption,
      option({ disabled: true }, ''),
      option({ value: 'size_letter_p' }, 'Letter Portrait'),
      option({ value: 'size_letter_l' }, 'Letter Landscape'),
    );

    const sheetTooSmallAlert = row('Sheet is too small to see marks · ', h('a', {
      href: '#',
      onclick: () => {
        sheetSizeSelect.value = 'size_page_marks';
        updateSheetSize();
      },
    }, 'Change'));
    const updateSheetSize = () => {
      const newVal = sheetSizeSelect.value;
      const marksHidden = (newVal === 'size_page' || newVal === 'size_page_bleed');
      sheetTooSmallAlert.style.display = marksHidden ? 'block' : 'none';
      viewer.setSheetSize(newVal);
    };
    sheetSizeSelect.addEventListener('change', updateSheetSize);

    const sheetSize = row('Sheet', sheetSizeSelect);

    const updateSheetSizeSelect = () => {
      const { width, height } = this.binder.styler.size;
      const bleed = this.binder.styler.bleed;
      sizePageOption.textContent = `${width} x ${height}`;
      sizePageBleedOption.textContent = `${width} x ${height} + ${bleed} bleed`;
      sizePageMarkOption.textContent = `${width} x ${height} + ${bleed} bleed + 12pt`;
    };
    updateSheetSizeSelect();

    const arrangeSelect = select(
      option({ value: 'arrange_one', selected: true }, '1 Page / Sheet'),
      option({ value: 'arrange_two' }, '1 Spread / Sheet'),
      option({ value: 'arrange_booklet' }, 'Booklet Order'),
      option({ disabled: true }, 'Grid'),
      option({ disabled: true }, 'Signatures'),
    );
    arrangeSelect.addEventListener('change', () => {
      viewer.setPrintArrange(arrangeSelect.value);
    });
    const arrangement = row('Layout', arrangeSelect);

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

        updateSheetSizeSelect();

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

      expandRow('Page Setup'),
      expandArea(
        layoutControl,
        row(layoutState),
      ),

      expandRow('Marks and Bleed'),
      expandArea(
        cropToggle,
        bleedMarkToggle,
        bleedAmount,
        sheetTooSmallAlert,
      ),

      arrangement,
      sheetSize,

      debugControls,

      row(doneBtn, printBtn),
    );
  }

}

export default Controls;
