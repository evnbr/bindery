import { div } from '../dom';

const directions = ['top', 'bottom', 'left', 'right'];
const bleedMarks = () => directions.map(dir => div(`.mark-bleed-${dir}`));
const cropMarks = () => directions.map(dir => div(`.mark-crop-${dir}`));

const pageSheetMarks = () => div('.page-size.print-mark-wrap',
  ...cropMarks(), 
  ...bleedMarks(),
);

const spreadSheetMarks = () => div('.spread-size.print-mark-wrap',
  div('.mark-crop-fold'), 
  ...cropMarks(), 
  ...bleedMarks(),
);

const bookletMeta = (i: number, len: number) => {
  const isFront = i % 4 === 0;
  const sheetIndex = Math.round((i + 1) / 4) + 1;
  return div('.print-meta', `Sheet ${sheetIndex} of ${len / 4}: ${isFront ? 'Outside' : 'Inside'}`);
};

export {
  pageSheetMarks,
  spreadSheetMarks,
  bookletMeta,
};
