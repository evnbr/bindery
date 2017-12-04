import h from 'hyperscript';
import c from '../utils/prefixClass';

import {
  title,
  select,
  option,
  btn,
  btnMain,
  row,
  // viewMode,
} from './components';

const supportsCustomPageSize = !!window.chrome && !!window.chrome.webstore;

class Controls {
  constructor(opts) {
    this.binder = opts.binder;
    const viewer = opts.viewer;

    let viewSelect;
    let marksSelect;
    let spinner;

    const print = () => {
      viewer.setPrint();

      const sel = viewSelect.querySelector('select');
      sel.value = 'view_print';
      sel.dispatchEvent(new Event('change'));

      setTimeout(window.print, 10);
    };

    const printBtn = btnMain({ onclick: print }, 'Print');

    const sheetSizes = supportsCustomPageSize ? [
      option({ value: 'size_page', selected: true }, 'Auto'),
      option({ value: 'size_page_bleed' }, 'Auto + Bleed'),
      option({ value: 'size_page_marks' }, 'Auto + Marks'),
      option({ value: 'size_letter_p' }, 'Letter Portrait'),
      option({ value: 'size_letter_l' }, 'Letter Landscape'),
      option({ value: 'size_a4_p' }, 'A4 Portrait'),
      option({ value: 'size_a4_l' }, 'A4 Landscape'),
    ] : [
      option({ value: 'size_letter_p', selected: true }, 'Default Page Size *'),
      option({ disabled: true }, 'Only Chrome supports custom page sizes. Set in your browser\'s print dialog instead.'),
    ];

    const updateSheetSizeNames = () => {
      // const layout = viewer.printArrange === 'arrange_one' ? 'Page' : 'Spread';
      if (!supportsCustomPageSize) return;
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
        marksSelect.classList.add(c('hidden-select'));
      } else {
        marksSelect.classList.remove(c('hidden-select'));
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

    marksSelect = select(
      { onchange: updateMarks },
      option({ value: 'marks_none' }, 'No Marks'),
      option({ value: 'marks_crop', selected: true }, 'Crop Marks'),
      option({ value: 'marks_bleed' }, 'Bleed Marks'),
      option({ value: 'marks_both' }, 'Crop and Bleed'),
    );
    if (supportsCustomPageSize) {
      marksSelect.classList.add(c('hidden-select'));
    }
    const marks = row(marksSelect);
    const sheetSize = row(sheetSizeSelect);

    const startPaginating = () => {
      this.binder.makeBook(() => {
      });
    };

    const headerContent = h('span', 'Loading');

    let playSlow;
    const step = btn('→', {
      style: { display: 'none' },
      onclick: () => {
        window.binderyDebug.step();
        document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
      },
    });
    const pause = btn('❙❙', {
      onclick: () => {
        window.binderyDebug.pause();
        spinner.classList.add(c('paused'));
        pause.style.display = 'none';
        playSlow.style.display = '';
        step.style.display = '';
      },
    });
    playSlow = btn('▶️', {
      style: { display: 'none' },
      onclick: () => {
        window.binderyDebug.resume();
        spinner.classList.remove(c('paused'));
        playSlow.style.display = 'none';
        pause.style.display = '';
        step.style.display = 'none';
      },
    });
    const debugDone = btn('Finish', {
      onclick: () => {
        spinner.classList.remove(c('paused'));
        window.binderyDebug.finish();
      },
    });

    const debugControls = h(c('.debug-controls'),
      pause,
      playSlow,
      step,
      debugDone,
    );

    spinner = h(c('.spinner'));
    const progressBar = h(c('.progress-bar'));
    const header = title(
      headerContent,
    );

    this.setInProgress = () => {
      headerContent.textContent = 'Paginating';
    };

    let lastUpdate = 0;
    this.updateProgress = (count, pct) => {
      const t = performance.now();
      if (t - lastUpdate > 100) {
        lastUpdate = t;
        progressBar.style.width = `${pct * 100}%`;
        headerContent.textContent = `${count} Pages`;
      }
    };

    this.setDone = () => {
      progressBar.style.width = '100%';
      headerContent.textContent = `${viewer.book.pages.length} Pages`;
    };

    this.setInvalid = () => {
    };

    printBtn.classList.add(c('btn-print'));
    const options = row(
      arrangement,
      sheetSize,
      marks
    );
    options.classList.add(c('print-options'));

    const updateView = (e) => {
      const val = e.target.value;
      if (val === 'view_grid') viewer.setGrid();
      else if (val === 'view_flip') viewer.setFlip();
      else if (val === 'view_print') viewer.setPrint();
    };
    viewSelect = select(
      { onchange: updateView },
      option({ value: 'view_grid' }, 'Preview'),
      option({ value: 'view_flip' }, 'Flipbook'),
      option({ value: 'view_print' }, 'Print Preview'),
    );
    const viewRow = row(viewSelect);
    viewRow.classList.add(c('view-row'));

    this.element = h(c('.controls'),
      progressBar,
      header,
      debugControls,
      viewRow,
      options,
      printBtn,
    );
  }

}

export default Controls;
