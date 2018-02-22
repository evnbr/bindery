import { el } from '../../utils';

const directions = ['top', 'bottom', 'left', 'right'];
const bleedMarks = () => directions.map(dir => el(`.bleed-${dir}`));
const cropMarks = () => directions.map(dir => el(`.crop${dir}`));

const printMarksSingle = () => el('.print-mark-wrap', [
  ...cropMarks(), ...bleedMarks(),
]);

const printMarksSpread = () => el('.print-mark-wrap', [
  el('.crop-fold'), ...cropMarks(), ...bleedMarks(),
]);

const bookletMeta = (i, len) => {
  const isFront = i % 4 === 0;
  const sheetIndex = parseInt((i + 1) / 4, 10) + 1;
  return el('.print-meta', `Sheet ${sheetIndex} of ${len / 4}: ${isFront ? 'Outside' : 'Inside'}`);
};

export {
  printMarksSingle,
  printMarksSpread,
  bookletMeta,
};
