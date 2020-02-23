import { prefixer } from '../dom-utils';


import {
  ViewerMode,
  SheetLayout,
  SheetSize,
  PageMarks
} from '../constants';

import {
  dropdown,
  option,
  btnMain,
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
  [ SheetSize.Auto, 'Auto' ],
  [ SheetSize.AutoBleed, 'Auto + Bleed' ],
  [ SheetSize.AutoMarks, 'Auto + Marks' ],
  [ SheetSize.LetterPortait, 'Letter Portrait' ],
  [ SheetSize.LetterLandscape, 'Auto' ],
  [ SheetSize.A4Portrait, 'A4 Portrait' ],
  [ SheetSize.A4Portrait, 'A4 Landscape' ],
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
      actions.setMode(ViewerMode.Print);

      const sel = viewSelect.querySelector('select')!;
      sel.value = ViewerMode.Print;
      sel.dispatchEvent(new Event('change'));

      setTimeout(window.print, 10);
    };

    const printBtn = btnMain({ onclick: print }, 'Print');

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
      if (newVal === 'auto' || newVal === 'auto-bleed') {
        marksSelect.classList.add(prefixer('hidden-select'));
      } else {
        marksSelect.classList.remove(prefixer('hidden-select'));
      }
    };

    const paperSelect = dropdown({ onchange: updatePaper }, sheetSizes);

    const sheetLayoutDropdown = row([enumDropdown([
        [ SheetLayout.PAGES, '1 Page / Sheet' ],
        [ SheetLayout.SPREADS, '1 Spread / Sheet' ],
        [ SheetLayout.BOOKLET, 'Booklet Sheets' ],
      ],
      initialState.layout,
      (newLayout) => {
        actions.setLayout(newLayout);
        updateSheetSizeNames();
      }
    )]);

    marksSelect = enumDropdown([
        [ PageMarks.None , 'No Marks' ],
        [ PageMarks.Crop, 'Crop Marks' ],
        [ PageMarks.Bleed, 'Bleed Marks' ],
        [ PageMarks.Both, 'Crop and Bleed' ],
      ],
      initialState.marks,
      (newMarks) => {
        actions.setMarks(newMarks);
      }
    );

    this.setDone = () => {};
    this.setInProgress = () => {};

    printBtn.classList.add(prefixer('btn-print'));
    const options = row([
      sheetLayoutDropdown,
      row([paperSelect]),
      row([marksSelect])
    ]);
    options.classList.add(prefixer('print-options'));


    viewSelect = enumDropdown([
        [ ViewerMode.Preview, 'Grid'],
        [ ViewerMode.Flipbook, 'Flipbook'],
        [ ViewerMode.Print, 'Print Preview']
      ],
      initialState.mode,
      (newMode) => {
        actions.setMode(newMode);
      }
    );

    const viewRow = row([viewSelect]);
    viewRow.classList.add(prefixer('view-row'));

    this.element = div(prefixer('controls'), [
      viewRow,
      options,
      printBtn
    ]);
  }

}

export default Controls;
