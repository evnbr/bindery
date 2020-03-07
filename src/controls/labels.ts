import { ViewerMode, SheetLayout, SheetSize, SheetMarks } from '../constants';

// TODO: This is not a particularly robust check.
const supportsCustomSheetSize = !!window.hasOwnProperty('chrome');

const getSheetSizeLabels = (pageSize: {
  width: string;
  height: string;
}): [SheetSize, string][] => {
  const sizeName = `${pageSize.width} × ${pageSize.height}`;

  if (!supportsCustomSheetSize) {
    return [
      [SheetSize.LETTER_PORTRAIT, 'Default Page Size *'],
      [
        SheetSize.LETTER_PORTRAIT,
        "Only Chrome supports custom page sizes. Set in your browser's print dialog instead.",
      ],
    ];
  }

  return [
    [SheetSize.AUTO, `${sizeName}`],
    [SheetSize.AUTO_BLEED, `${sizeName} + Bleed`],
    [SheetSize.AUTO_MARKS, `${sizeName} + Marks`],
    [SheetSize.LETTER_PORTRAIT, 'Letter Portrait'],
    [SheetSize.LETTER_LANDSCAPE, 'Letter Landscape'],
    [SheetSize.A4_PORTRAIT, 'A4 Portrait'],
    [SheetSize.A4_LANDSCAPE, 'A4 Landscape'],
  ];
};

const marksLabels: [SheetMarks, string][] = [
  [SheetMarks.NONE, 'No Marks'],
  [SheetMarks.CROP, 'Crop Marks'],
  [SheetMarks.BLEED, 'Bleed Marks'],
  [SheetMarks.BOTH, 'Crop and Bleed'],
];

const modeLabels: [ViewerMode, string][] = [
  [ViewerMode.PREVIEW, 'Grid'],
  [ViewerMode.FLIPBOOK, 'Flipbook'],
  [ViewerMode.PRINT, 'Print Preview'],
];

const layoutLabels: [SheetLayout, string][] = [
  [SheetLayout.PAGES, '1 Page / Sheet'],
  [SheetLayout.SPREADS, '1 Spread / Sheet'],
  [SheetLayout.BOOKLET, 'Booklet Sheets'],
];

export { getSheetSizeLabels, marksLabels, modeLabels, layoutLabels };
