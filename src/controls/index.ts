import { prefixer } from '../dom-utils';
import { Mode, Paper, Layout, Marks } from '../constants';
import {
  dropdown,
  option,
  btnMain,
  row,
  div,
} from './components';

interface ControlsInitialState {
  paper: number;
  marks: number;
  mode: number;
  layout: number;
}
interface ControlsActions {
  setMode: (newVal: any) => void;
  setLayout: (newVal: any) => void;
  setPaper: (newVal: any) => void;
  setMarks: (newVal: any) => void;
  getPageSize: () => { width: number, height: number };
}


// TODO: This is not a particularly robust check.
const supportsCustomPageSize = !!window.hasOwnProperty('chrome');

class Controls {
  element: HTMLElement;
  setDone: () => void;
  setInProgress: () => void;

  constructor(initialState: ControlsInitialState, actions: ControlsActions) {

    let viewSelect: HTMLElement;
    let marksSelect: HTMLElement;

    const print = () => {
      actions.setMode(Mode.PRINT);

      const sel = viewSelect.querySelector('select')!;
      sel.value = `${Mode.PRINT}`;
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
      if (parseInt(opt.value, 10) === initialState.paper) { opt.selected = true; }
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

    const updatePaper = (e: Event) => {
      const sel = e.target as HTMLSelectElement
      const newVal = parseInt(sel.value, 10);
      actions.setPaper(newVal);
      if (newVal === Paper.AUTO || newVal === Paper.AUTO_BLEED) {
        marksSelect.classList.add(prefixer('hidden-select'));
      } else {
        marksSelect.classList.remove(prefixer('hidden-select'));
      }
    };

    const sheetSizeSelect = dropdown({ onchange: updatePaper }, paperSizes);

    const layoutSelect = dropdown(
      {
        onchange: (e: Event) => {
          const target = e.target as HTMLSelectElement;
          actions.setLayout(target.value);
          updateSheetSizeNames();
        }
      },
      [
        option({ value: Layout.PAGES }, '1 Page / Sheet'),
        option({ value: Layout.SPREADS }, '1 Spread / Sheet'),
        option({ value: Layout.BOOKLET }, 'Booklet Sheets'),
      ].map((opt) => {
        if (parseInt(opt.value, 10) === initialState.layout) { opt.selected = true; }
        return opt;
      })
    );
    const arrangement = row([layoutSelect]);

    marksSelect = dropdown(
      {
        onchange: (e: Event) => {
          const target = e.target as HTMLSelectElement;
          actions.setMarks(target.value);
        }
      },
      [
        option({ value: Marks.NONE }, 'No Marks'),
        option({ value: Marks.CROP, selected: true }, 'Crop Marks'),
        option({ value: Marks.BLEED }, 'Bleed Marks'),
        option({ value: Marks.BOTH }, 'Crop and Bleed'),
      ].map((opt) => {
        if (parseInt(opt.value, 10) === initialState.marks) { opt.selected = true; }
        return opt;
      })
    );
    if (supportsCustomPageSize) {
      marksSelect.classList.add(prefixer('hidden-select'));
    }
    const marks = row([marksSelect]);
    const sheetSize = row([sheetSizeSelect]);


    this.setDone = () => {};
    this.setInProgress = () => {};

    printBtn.classList.add(prefixer('btn-print'));
    const options = row([arrangement, sheetSize, marks]);
    options.classList.add(prefixer('print-options'));

    viewSelect = dropdown(
      { onchange: (e: Event) => {
          const target = e.target as HTMLSelectElement;
          actions.setMode(target.value);
        },
      },
      [
        option({ value: Mode.PREVIEW }, 'Grid'),
        option({ value: Mode.FLIPBOOK }, 'Flipbook'),
        option({ value: Mode.PRINT }, 'Print Preview'),
      ].map((opt) => {
        if (parseInt(opt.value, 10) === initialState.mode) { opt.selected = true; }
        return opt;
      })
    );
    const viewRow = row([viewSelect]);
    viewRow.classList.add(prefixer('view-row'));

    this.element = div(prefixer('controls'), [viewRow, options, printBtn]);
  }

}

export default Controls;
