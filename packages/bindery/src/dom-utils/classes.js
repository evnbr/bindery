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
  const val = classes[k];
  classes[k] = prefix(val);
});

classes.allModes = [classes.viewPreview, classes.viewPrint, classes.viewFlip];
classes[Mode.PREVIEW] = classes.viewPreview;
classes[Mode.PRINT] = classes.viewPrint;
classes[Mode.FLIPBOOK] = classes.viewFlip;

export default classes;
