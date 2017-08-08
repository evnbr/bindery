import h from 'hyperscript';
import c from '../utils/prefixClass';

const bleedMarks = () => [
  h(c('.bleed-top')),
  h(c('.bleed-bottom')),
  h(c('.bleed-left')),
  h(c('.bleed-right')),
];
const cropMarks = () => [
  h(c('.crop-top')),
  h(c('.crop-bottom')),
  h(c('.crop-left')),
  h(c('.crop-right')),
];
const printMarksSingle = () => h(c('.print-mark-wrap'),
  ...cropMarks(),
  ...bleedMarks()
);
const printMarksSpread = () => h(c('.print-mark-wrap'),
  h(c('.crop-fold')),
  ...cropMarks(),
  ...bleedMarks()
);

const bookletMeta = (i, len) => {
  const isFront = i % 4 === 0;
  const sheetIndex = parseInt((i + 1) / 4, 10) + 1;
  return h(c('.print-meta'),
    `Sheet ${sheetIndex} of ${len / 4}: ${isFront ? 'Outside' : 'Inside'}`);
};

export {
  printMarksSingle,
  printMarksSpread,
  bookletMeta,
};
