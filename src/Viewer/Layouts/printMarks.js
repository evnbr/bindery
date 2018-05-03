import { createEl } from '../../utils';

const directions = ['top', 'bottom', 'left', 'right'];
const bleedMarks = () => directions.map(dir => createEl(`.bleed-${dir}`));
const cropMarks = () => directions.map(dir => createEl(`.crop-${dir}`));

const printMarksSingle = () => createEl('.print-mark-wrap', [
  ...cropMarks(), ...bleedMarks(),
]);

const printMarksSpread = () => createEl('.print-mark-wrap', [
  createEl('.crop-fold'), ...cropMarks(), ...bleedMarks(),
]);

const bookletMeta = (i, len) => {
  const isFront = i % 4 === 0;
  const sheetIndex = parseInt((i + 1) / 4, 10) + 1;
  return createEl('.print-meta', `Sheet ${sheetIndex} of ${len / 4}: ${isFront ? 'Outside' : 'Inside'}`);
};

export {
  printMarksSingle,
  printMarksSpread,
  bookletMeta,
};
