import { prefixer } from '../dom';


import {
  ViewerMode,
  SheetLayout,
  SheetSize,
  PageMarks
} from '../constants';

import {
  dropdown,
  option,
  btn,
  row,
  div,
  enumDropdown,
} from './components';

interface ControlsInitialState {
  paper: SheetSize;
  marks: PageMarks;
  mode: ViewerMode;
  layout: SheetLayout;
}

interface ControlsActions {
  setMode: (newVal: ViewerMode) => void;
  setLayout: (newVal: SheetLayout) => void;
  setPaper: (newVal: SheetSize) => void;
  setMarks: (newVal: PageMarks) => void;
  getPageSize: () => { width: string, height: string };
}

const sizeLabels: [ SheetSize, string ][] = [
  [ SheetSize.AUTO, 'Auto' ],
  [ SheetSize.AUTO_BLEED, 'Auto + Bleed' ],
  [ SheetSize.AUTO_MARKS, 'Auto + Marks' ],
  [ SheetSize.LETTER_PORTRAIT, 'Letter Portrait' ],
  [ SheetSize.LETTER_LANDSCAPE, 'Auto' ],
  [ SheetSize.A4_PORTRAIT, 'A4 Portrait' ],
  [ SheetSize.A4_PORTRAIT, 'A4 Landscape' ],
];

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
      actions.setMode(ViewerMode.PRINT);

      const sel = viewSelect.querySelector('select')!;
      sel.value = ViewerMode.PRINT;
      sel.dispatchEvent(new Event('change'));

      setTimeout(window.print, 10);
    };

    const printBtn = btn('.btn-print.btn-main', { onclick: print }, 'Print');

    const sheetSizes = (supportsCustomPageSize ? sizeLabels.map((entry) => {
      return option({ value: entry[0]}, entry[1]);
    }) : [
      option({ value: 'letter-portrait', selected: true }, 'Default Page Size *'),
      option({ disabled: true }, 'Only Chrome supports custom page sizes. Set in your browser\'s print dialog instead.'),
    ]).map((opt) => {
      if (opt.value === initialState.paper) { opt.selected = true; }
      return opt;
    });

    const updateSheetSizeNames = () => {
      if (!supportsCustomPageSize) return;
      const size = actions.getPageSize();
      const sizeName = `${size.width} × ${size.height}`;
      sheetSizes[0].textContent = `${sizeName}`;
      sheetSizes[1].textContent = `${sizeName} + Bleed`;
      sheetSizes[2].textContent = `${sizeName} + Marks`;
    };
    updateSheetSizeNames();

    const updatePaper = (e: Event) => {
      const sel = e.target as HTMLSelectElement
      const newVal = sel.value as SheetSize;
      actions.setPaper(newVal);
      const hideMarksSelect = newVal === 'auto' || newVal === 'auto-bleed';
      marksSelect.classList.toggle(prefixer('hidden-select'), hideMarksSelect);
    };

    const paperSelect = dropdown({ onchange: updatePaper }, sheetSizes);

    const sheetLayoutDropdown = row(null, enumDropdown([
        [ SheetLayout.PAGES, '1 Page / Sheet' ],
        [ SheetLayout.SPREADS, '1 Spread / Sheet' ],
        [ SheetLayout.BOOKLET, 'Booklet Sheets' ],
      ],
      initialState.layout,
      (newLayout) => {
        actions.setLayout(newLayout);
        updateSheetSizeNames();
      }
    ));

    marksSelect = enumDropdown([
        [ PageMarks.NONE , 'No Marks' ],
        [ PageMarks.CROP, 'Crop Marks' ],
        [ PageMarks.BLEED, 'Bleed Marks' ],
        [ PageMarks.BOTH, 'Crop and Bleed' ],
      ],
      initialState.marks,
      (newMarks) => {
        actions.setMarks(newMarks);
      }
    );

    this.setDone = () => {};
    this.setInProgress = () => {};

    const printOptions = row('.print-options',
      sheetLayoutDropdown,
      row(null, paperSelect),
      row(null, marksSelect)
    );

    viewSelect = enumDropdown([
        [ ViewerMode.PREVIEW, 'Grid'],
        [ ViewerMode.FLIPBOOK, 'Flipbook'],
        [ ViewerMode.PRINT, 'Print Preview']
      ],
      initialState.mode,
      (newMode) => {
        actions.setMode(newMode);
      }
    );

    const viewRow = row('.view-row', viewSelect);

    this.element = div('.controls', 
      viewRow,
      printOptions,
      printBtn
    );
  }

}

export default Controls;
