import prefix from './prefixer';

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
  isOverlowing: 'is-overflowing',

  toNext: 'continues',
  fromPrev: 'continuation',
};

Object.keys(classes).forEach((k) => {
  const val = classes[k];
  classes[k] = prefix(val);
});

export default classes;
