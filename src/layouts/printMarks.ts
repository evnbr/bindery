import { createEl } from '../dom-utils';

const directions = ['top', 'bottom', 'left', 'right'];
const bleedMarks = () => directions.map(dir => createEl(`.mark-bleed-${dir}`));
const cropMarks = () => directions.map(dir => createEl(`.mark-crop-${dir}`));

const printMarksSingle = () => createEl('.page-size.print-mark-wrap', [
  ...cropMarks(), ...bleedMarks(),
]);

const printMarksSpread = () => createEl('.spread-size.print-mark-wrap', [
  createEl('.mark-crop-fold'), ...cropMarks(), ...bleedMarks(),
]);

const bookletMeta = (i: number, len: number) => {
  const isFront = i % 4 === 0;
  const sheetIndex = Math.round((i + 1) / 4) + 1;
  return createEl('.print-meta', `Sheet ${sheetIndex} of ${len / 4}: ${isFront ? 'Outside' : 'Inside'}`);
};

export {
  printMarksSingle,
  printMarksSpread,
  bookletMeta,
};
