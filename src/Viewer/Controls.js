import h from 'hyperscript';
import c from '../utils/prefixClass';
import { Mode, Paper, Layout, Marks } from '../Constants';

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
  constructor(initialState, actions) {
    let viewSelect;
    let marksSelect;
    let spinner;

    const print = () => {
      actions.setMode(Mode.PRINT);

      const sel = viewSelect.querySelector('select');
      sel.value = Mode.PRINT;
      sel.dispatchEvent(new Event('change'));

      setTimeout(window.print, 10);
    };

    const printBtn = btnMain({ onclick: print }, 'Print');

    const paperSizes = (supportsCustomPageSize ? [
      option({ value: Paper.AUTO }, 'Auto'),
      option({ value: Paper.AUTO_BLEED }, 'Auto + Bleed'),
      option({ value: Paper.AUTO_MARKS }, 'Auto + Marks'),
      option({ value: Paper.LETTER_PORTRAIT }, 'Letter Portrait'),
      option({ value: Paper.LETTER_LANDSCAPE }, 'Letter Landscape'),
      option({ value: Paper.A4_PORTRAIT }, 'A4 Portrait'),
      option({ value: Paper.A4_LANDSCAPE }, 'A4 Landscape'),
    ] : [
      option({ value: Paper.LETTER_PORTRAIT, selected: true }, 'Default Page Size *'),
      option({ disabled: true }, 'Only Chrome supports custom page sizes. Set in your browser\'s print dialog instead.'),
    ]).map((opt) => {
      if (opt.value === initialState.paper) { opt.selected = true; }
      return opt;
    });

    const updateSheetSizeNames = () => {
      if (!supportsCustomPageSize) return;
      const size = actions.getPageSize();
      const sizeName = `${size.width} × ${size.height}`;
      paperSizes[0].textContent = `${sizeName}`;
      paperSizes[1].textContent = `${sizeName} + Bleed`;
      paperSizes[2].textContent = `${sizeName} + Marks`;
    };
    updateSheetSizeNames();

    const updatePaper = (e) => {
      const newVal = e.target.value;
      actions.setPaper(newVal);
      if (newVal === Paper.AUTO || newVal === Paper.AUTO_BLEED) {
        marksSelect.classList.add(c('hidden-select'));
      } else {
        marksSelect.classList.remove(c('hidden-select'));
      }
    };

    const sheetSizeSelect = select({ onchange: updatePaper }, ...paperSizes);

    const layoutSelect = select(
      { onchange: (e) => {
        actions.setLayout(e.target.value);
        updateSheetSizeNames();
      } },
      ...[
        option({ value: Layout.PAGES }, '1 Page / Sheet'),
        option({ value: Layout.SPREADS }, '1 Spread / Sheet'),
        option({ value: Layout.BOOKLET }, 'Booklet Sheets'),
      ].map((opt) => {
        if (opt.value === initialState.layout) { opt.selected = true; }
        return opt;
      })
    );
    const arrangement = row(layoutSelect);

    marksSelect = select(
      { onchange: e => actions.setMarks(e.target.value) },
      ...[option({ value: Marks.NONE }, 'No Marks'),
        option({ value: Marks.CROP, selected: true }, 'Crop Marks'),
        option({ value: Marks.BLEED }, 'Bleed Marks'),
        option({ value: Marks.CROP }, 'Crop and Bleed'),
      ].map((opt) => {
        if (opt.value === initialState.marks) { opt.selected = true; }
        return opt;
      })
    );
    if (supportsCustomPageSize) {
      marksSelect.classList.add(c('hidden-select'));
    }
    const marks = row(marksSelect);
    const sheetSize = row(sheetSizeSelect);

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

    this.setDone = (length) => {
      progressBar.style.width = '100%';
      headerContent.textContent = `${length} Pages`;
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

    viewSelect = select(
      { onchange: e => actions.setMode(e.target.value) },
      ...[
        option({ value: Mode.PREVIEW }, 'Preview'),
        option({ value: Mode.FLIPBOOK }, 'Flipbook'),
        option({ value: Mode.PRINT }, 'Print Preview'),
      ].map((opt) => {
        if (opt.value === initialState.mode) { opt.selected = true; }
        return opt;
      })
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
