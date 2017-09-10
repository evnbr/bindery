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
  row,
  viewMode,
  // expandRow,
  // expandArea,
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

    const doneBtn = btn({ onclick: () => {
      if (this.binder.autorun) {
        window.history.back();
      } else {
        this.binder.cancel();
      }
    } }, 'Done');

    const s = this.binder.pageSetup;
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

    const sheetSizes = [
      option({ value: 'size_page' }, 'Auto'),
      option({ value: 'size_page_bleed' }, 'Auto + Bleed'),
      option({ value: 'size_page_marks', selected: true }, 'Auto + Marks'),
      option({ value: 'size_letter_p' }, 'Letter Portrait'),
      option({ value: 'size_letter_l' }, 'Letter Landscape'),
    ];
    const sheetSizeSelect = select(...sheetSizes);

    const updateSheetSizeNames = () => {
      const layout = viewer.printArrange === 'arrange_one' ? 'Page' : 'Spread';
      sheetSizes[0].textContent = `${layout}`;
      sheetSizes[1].textContent = `${layout} + Bleed`;
      sheetSizes[2].textContent = `${layout} + Marks`;
    };
    updateSheetSizeNames();

    const sheetTooSmallAlert = row('Sheet is too small to see marks · ', h('a', {
      href: '#',
      onclick: () => {
        sheetSizeSelect.value = 'size_page_marks';
        updateSheetSize();
      },
    }, 'Change'));
    sheetTooSmallAlert.style.color = 'rgba(0,0,0,0.4)';

    const updateSheetSize = () => {
      const newVal = sheetSizeSelect.value;
      const marksHidden = (newVal === 'size_page' || newVal === 'size_page_bleed');
      sheetTooSmallAlert.style.display = marksHidden ? 'block' : 'none';
      viewer.setSheetSize(newVal);
      this.binder.pageSetup.updateStylesheet();
    };
    sheetSizeSelect.addEventListener('change', updateSheetSize);

    const sheetSize = row('Sheet Size', sheetSizeSelect);

    const arrangeSelect = select(
      option({ value: 'arrange_one', selected: true }, '1 Page / Sheet'),
      option({ value: 'arrange_two' }, '1 Spread / Sheet'),
      option({ value: 'arrange_booklet' }, 'Booklet Order'),
      option({ disabled: true }, 'Grid'),
      option({ disabled: true }, 'Signatures'),
    );
    arrangeSelect.addEventListener('change', () => {
      viewer.setPrintArrange(arrangeSelect.value);
      updateSheetSizeNames();
    });
    const arrangement = row('Layout', arrangeSelect);


    const marksSelect = select(
      option({ value: 'marks_none' }, 'None'),
      option({ value: 'marks_crop', selected: true }, 'Crop'),
      option({ value: 'marks_bleed' }, 'Bleed'),
      option({ value: 'marks_both' }, 'Crop and Bleed'),
    );
    const marks = row('Marks', marksSelect);
    marksSelect.addEventListener('change', () => {
      switch (marksSelect.value) {
      case 'marks_none':
        viewer.isShowingCropMarks = false;
        viewer.isShowingBleedMarks = false;
        break;
      case 'marks_crop':
        viewer.isShowingCropMarks = true;
        viewer.isShowingBleedMarks = false;
        break;
      case 'marks_bleed':
        viewer.isShowingCropMarks = false;
        viewer.isShowingBleedMarks = true;
        break;
      case 'marks_both':
        viewer.isShowingCropMarks = true;
        viewer.isShowingBleedMarks = true;
        break;
      default:
      }
    });

    const validCheck = h('div', { style: {
      display: 'none',
      color: '#e2b200',
    } }, 'Too Small');

    const startPaginating = () => {
      refreshPaginationBtn.style.display = 'none';
      refreshPaginationBtnDebug.style.display = 'none';
      this.binder.makeBook(() => {
        refreshPaginationBtn.style.display = '';
        refreshPaginationBtnDebug.style.display = '';
      });
    };
    const refreshPaginationBtn = btn({ onclick: () => {
      this.binder.debug = false;
      startPaginating();
    } }, 'Update Pagination');

    const viewModes = [
      viewMode('grid', viewer.setGrid, 'Grid'),
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
    updateLayoutPreview(this.binder.pageSetup.size, this.binder.pageSetup.margin);

    this.setInProgress = () => {
      headerContent.textContent = 'Paginating';
      validCheck.style.display = 'none';
      refreshPaginationBtn.style.display = 'none';
    };

    this.updateProgress = (count) => {
      headerContent.textContent = `${count} Pages`;
    };

    this.setDone = () => {
      headerContent.textContent = `${viewer.book.pages.length} Pages`;
      refreshPaginationBtn.style.display = '';
      validCheck.style.display = 'none';
    };

    this.setInvalid = () => {
      validCheck.style.display = '';
      refreshPaginationBtn.style.display = '';
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
        Object.keys(newMargin).some(k => this.binder.pageSetup.margin[k] !== newMargin[k])
        || Object.keys(newSize).some(k => this.binder.pageSetup.size[k] !== newSize[k])
        || this.binder.pageSetup.bleed !== newBleed;

      if (needsUpdate) {
        updateLayoutPreview(newSize, newMargin);
        this.binder.pageSetup.setSize(newSize);
        this.binder.pageSetup.setMargin(newMargin);
        this.binder.pageSetup.setBleed(newBleed);

        this.binder.pageSetup.updateStylesheet();
        viewer.updateZoom();

        if (this.binder.autoupdate) {
          if (this.binder.pageSetup.isSizeValid()) {
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
    );

    this.element = h(c('.controls'),
      header,
      viewSwitcher,

      // expandRow('Page Setup'),
      // expandArea(
      //   layoutControl,
      //   bleedAmount,
      //   row(layoutState),
      // ),

      // expandRow('Marks and Bleed'),
      // expandArea(
      //   cropToggle,
      //   bleedMarkToggle,
      //   sheetTooSmallAlert,
      // ),
      arrangement,
      sheetSize,
      marks,

      debugControls,

      row(doneBtn, printBtn),
    );
  }

}

export default Controls;
