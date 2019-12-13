import { c } from "../dom-utils";
import { dropdown, option, btnMain, row, div } from "./components";

// TODO: This is not a particularly robust check.
const supportsCustomPageSize = !!window.chrome;

class Controls {
  constructor(availableOptions, initialState, actions) {
    const { Mode, Paper, Layout, Marks } = availableOptions;
    const { options } = initialState;

    let viewSelect;
    let marksSelect;

    const print = () => {
      actions.setMode(Mode.PRINT);

      const sel = viewSelect.querySelector("select");
      sel.value = Mode.PRINT;
      sel.dispatchEvent(new Event("change"));

      setTimeout(window.print, 10);
    };

    const printBtn = options.hidePrint
      ? null
      : btnMain({ onclick: print }, "Print");

    const paperSizes =
      options.paperSizes ||
      (supportsCustomPageSize
        ? [
            option({ value: Paper.AUTO }, "Auto"),
            option({ value: Paper.AUTO_BLEED }, "Auto + Bleed"),
            option({ value: Paper.AUTO_MARKS }, "Auto + Marks"),
            option({ value: Paper.LETTER_PORTRAIT }, "Letter Portrait"),
            option({ value: Paper.LETTER_LANDSCAPE }, "Letter Landscape"),
            option({ value: Paper.A4_PORTRAIT }, "A4 Portrait"),
            option({ value: Paper.A4_LANDSCAPE }, "A4 Landscape")
          ]
        : [
            option(
              { value: Paper.LETTER_PORTRAIT, selected: true },
              "Default Page Size *"
            ),
            option(
              { disabled: true },
              "Only Chrome supports custom page sizes. Set in your browser's print dialog instead."
            )
          ]
      ).map(opt => {
        if (parseInt(opt.value, 10) === initialState.paper) {
          opt.selected = true;
        }
        return opt;
      });

    const updateSheetSizeNames = () => {
      if (!supportsCustomPageSize || !paperSizes.length) return;
      const size = actions.getPageSize();
      const sizeName = `${size.width} × ${size.height}`;
      paperSizes[0].textContent = `${sizeName}`;
      paperSizes[1].textContent = `${sizeName} + Bleed`;
      paperSizes[2].textContent = `${sizeName} + Marks`;
    };
    updateSheetSizeNames();

    const updatePaper = e => {
      const newVal = parseInt(e.target.value, 10);
      actions.setPaper(newVal);
      if (newVal === Paper.AUTO || newVal === Paper.AUTO_BLEED) {
        marksSelect.classList.add(c("hidden-select"));
      } else {
        marksSelect.classList.remove(c("hidden-select"));
      }
    };

    const sheetSizeSelect =
      paperSizes.length > 0 && dropdown({ onchange: updatePaper }, paperSizes);

    const layoutOptions = options.layout || [
      option({ value: Layout.PAGES }, "1 Page / Sheet"),
      option({ value: Layout.SPREADS }, "1 Spread / Sheet"),
      option({ value: Layout.BOOKLET }, "Booklet Sheets")
    ];

    const layoutSelect = dropdown(
      {
        onchange: e => {
          actions.setLayout(e.target.value);
          updateSheetSizeNames();
        }
      },
      layoutOptions.map(opt => {
        if (parseInt(opt.value, 10) === initialState.layout) {
          opt.selected = true;
        }
        return opt;
      })
    );
    const arrangement = layoutOptions.length > 0 && row([layoutSelect]);
    const marksOptions = options.marks || [
      option({ value: Marks.NONE }, "No Marks"),
      option({ value: Marks.CROP, selected: true }, "Crop Marks"),
      option({ value: Marks.BLEED }, "Bleed Marks"),
      option({ value: Marks.BOTH }, "Crop and Bleed")
    ];

    marksSelect =
      marksOptions > 0 &&
      dropdown(
        { onchange: e => actions.setMarks(e.target.value) },
        marksOptions.map(opt => {
          if (opt.value === initialState.marks) {
            opt.selected = true;
          }
          return opt;
        })
      );
    if (supportsCustomPageSize && marksSelect) {
      marksSelect.classList.add(c("hidden-select"));
    }
    const marks = marksOptions.length > 0 && row([marksSelect]);
    const sheetSize = sheetSizeSelect && row([sheetSizeSelect]);

    this.setDone = () => {};
    this.setInProgress = () => {};
    this.updateProgress = () => {};

    printBtn && printBtn.classList.add(c("btn-print"));

    const optionBarElements = []; // [arrangement, sheetSize, marks]
    arrangement && optionBarElements.pop(arrangement);
    sheetSize && optionBarElements.pop(sheetSize);
    marks && optionBarElements.pop(marks);

    const optionBar = row(optionBarElements);
    optionBar.classList.add(c("print-options"));

    const viewOptions = options.views || [
      option({ value: Mode.PREVIEW }, "Grid"),
      option({ value: Mode.FLIPBOOK }, "Flipbook"),
      option({ value: Mode.PRINT }, "Print Preview")
    ];

    viewSelect = dropdown(
      { onchange: e => actions.setMode(e.target.value) },
      viewOptions.map(opt => {
        if (opt.value === initialState.mode) {
          opt.selected = true;
        }
        return opt;
      })
    );
    const viewRow = row([viewSelect]);
    viewRow.classList.add(c("view-row"));

    const allControls = [viewRow, optionBar];
    printBtn && allControls.push(printBtn);

    this.element = div(c("controls"), allControls);
  }
}

Controls.option = option;
export default Controls;
