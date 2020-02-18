import prefix from './prefixer';
import { Mode } from '../constants';

const classes = {
  showBleed: 'show-bleed',
  showCrop: 'show-crop',
  showBleedMarks: 'show-bleed-marks',

  isViewing: 'viewing',
  viewPreview: 'view-preview',
  viewPrint: 'view-print',
  viewFlip: 'view-flip',
  inProgress: 'in-progress',

  leftPage: 'left',
  rightPage: 'right',
  isOverflowing: 'is-overflowing',

  printSheet: 'print-sheet',
  sheetSpread: 'print-sheet-spread',
  sheetLeft: 'print-sheet-left',
  sheetRight: 'print-sheet-right',

  toNext: 'continues',
  fromPrev: 'continuation',
};

Object.keys(classes).forEach((k) => {
  const key = k as keyof typeof classes;
  const val = classes[key];
  classes[key] = prefix(val);
});

const allModeClasses = [classes.viewPreview, classes.viewPrint, classes.viewFlip];

const classForMode = (mode: number): string => {
  switch (mode) {
    case Mode.PREVIEW: return classes.viewPreview;
    case Mode.PRINT: return classes.viewPrint;
    case Mode.FLIPBOOK: return classes.viewFlip;
    default: throw Error ("Unknonw mode");
  }
}

export {
  classes,
  allModeClasses,
  classForMode
};
