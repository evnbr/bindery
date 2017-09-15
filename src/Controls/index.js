import h from 'hyperscript';
// import { convertStrToPx } from '../utils/convertUnits';
import c from '../utils/prefixClass';

import {
  title,
  select,
  option,
  btn,
  btnMain,
  row,
  viewMode,
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

    const viewModes = [
      viewMode('grid', viewer.setGrid, 'Grid'),
      viewMode('outline', viewer.setOutline, 'Outline'),
      viewMode('flip', viewer.setFlip, 'Flip'),
      viewMode('print', viewer.setPrint, 'Sheet'),
    ];

    const viewSwitcher = h(c('.viewswitcher'), ...viewModes);

    const headerContent = h('span', 'Loading');

    const refreshPaginationBtn = h('a', { onclick: () => {
      this.binder.debug = false;
      startPaginating();
    } }, 'Refresh');
    refreshPaginationBtn.classList.add(c('refresh'));
    const refreshPaginationBtnDebug = h('a', 'Debug', {
      onclick: () => {
        playSlow.style.display = 'none';
        step.style.display = 'none';
        pause.style.display = '';
        this.binder.debug = true;
        startPaginating();
      },
    });
    const header = title(
      h(c('.spinner')),
      headerContent,
      h(c('.refresh-btns'),
        refreshPaginationBtn,
        refreshPaginationBtnDebug
      )
    );

    this.setInProgress = () => {
      headerContent.textContent = 'Paginating';
      validCheck.style.display = 'none';
    };

    this.updateProgress = (count) => {
      headerContent.textContent = `${count} Pages`;
    };

    this.setDone = () => {
      headerContent.textContent = `${viewer.book.pages.length} Pages`;
      validCheck.style.display = 'none';
    };

    this.setInvalid = () => {
      validCheck.style.display = '';
    };

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
    const debugDone = btn('Finish', {
      onclick: () => {
        window.binderyDebug.finish();
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

    this.element = h(c('.controls'),
      header,
      viewSwitcher,

      arrangement,
      sheetSize,
      marks,

      debugControls,

      row(printBtn),
    );
  }

}

export default Controls;
