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
      option({ value: 'size_page', selected: true }, 'Auto'),
      option({ value: 'size_page_bleed' }, 'Auto + Bleed'),
      option({ value: 'size_page_marks' }, 'Auto + Marks'),
      option({ value: 'size_letter_p' }, 'Letter Portrait'),
      option({ value: 'size_letter_l' }, 'Letter Landscape'),
      option({ value: 'size_a4_p' }, 'A4 Portrait'),
      option({ value: 'size_a4_l' }, 'A4 Landscape'),
    ];

    const updateSheetSizeNames = () => {
      // const layout = viewer.printArrange === 'arrange_one' ? 'Page' : 'Spread';
      const size = this.binder.pageSetup.displaySize;
      const sizeName = `${size.width} × ${size.height}`;
      sheetSizes[0].textContent = `${sizeName}`;
      sheetSizes[1].textContent = `${sizeName} + Bleed`;
      sheetSizes[2].textContent = `${sizeName} + Marks`;
    };
    updateSheetSizeNames();

    const updateSheetSize = (e) => {
      const newVal = e.target.value;
      viewer.setSheetSize(newVal);
      if (newVal === 'size_page' || newVal === 'size_page_bleed') {
        // marksSelect.value = 'marks_none';
        marksSelect.disabled = true;
        marksSelect.classList.add(c('hidden-select'));
      } else {
        marksSelect.classList.remove(c('hidden-select'));
        marksSelect.disabled = false;
      }

      this.binder.pageSetup.updateStylesheet();
    };
    const sheetSizeSelect = select({ onchange: updateSheetSize }, ...sheetSizes);

    const arrangeSelect = select(
      { onchange: (e) => {
        viewer.setPrintArrange(e.target.value);
        updateSheetSizeNames();
      } },
      option({ value: 'arrange_one', selected: true }, '1 Page / Sheet'),
      option({ value: 'arrange_two' }, '1 Spread / Sheet'),
      option({ value: 'arrange_booklet' }, 'Booklet Sheets'),
      // option({ disabled: true }, 'Grid'),
      // option({ disabled: true }, 'Signatures'),
    );
    const arrangement = row(arrangeSelect);

    const updateMarks = (e) => {
      switch (e.target.value) {
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
    };

    const marksSelect = select(
      { onchange: updateMarks },
      option({ value: 'marks_none' }, 'No Marks'),
      option({ value: 'marks_crop', selected: true }, 'Crop Marks'),
      option({ value: 'marks_bleed' }, 'Bleed Marks'),
      option({ value: 'marks_both' }, 'Crop and Bleed'),
    );
    marksSelect.classList.add(c('hidden-select'));
    const marks = row(marksSelect);
    const sheetSize = row(sheetSizeSelect);

    const validCheck = h('div', { style: {
      display: 'none',
      color: '#e2b200',
    } }, 'Too Small');

    const startPaginating = () => {
      this.binder.makeBook(() => {
      });
    };

    const viewModes = [
      viewMode('grid', viewer.setGrid, 'Grid'),
      // viewMode('outline', viewer.setOutline, 'Outline'),
      viewMode('flip', viewer.setFlip, 'Flip'),
      viewMode('print', viewer.setPrint, 'Sheet'),
    ];

    const viewSwitcher = h(c('.viewswitcher'), ...viewModes);

    const headerContent = h('span', 'Loading');

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

    const debugControls = h('div',
      pause,
      playSlow,
      step,
      debugDone,
    );
    debugControls.classList.add(c('debug-controls'));

    const refreshPaginationBtn = h('a', { onclick: () => {
      this.binder.debug = false;
      startPaginating();
    } }, 'Refresh');
    refreshPaginationBtn.classList.add(c('refresh'));
    const refreshPaginationBtnDebug = h('a', '🐞', {
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
      ),
      debugControls,
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

    printBtn.classList.add(c('btn-print'));
    const options = row(
      arrangement,
      sheetSize,
      marks
    );
    options.classList.add(c('print-options'));


    this.element = h(c('.controls'),
      viewSwitcher,
      options,
      header,
      printBtn,
    );
  }

}

export default Controls;
