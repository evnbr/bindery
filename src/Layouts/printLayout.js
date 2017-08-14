import h from 'hyperscript';
import c from '../utils/prefixClass';
import { printMarksSingle, printMarksSpread, bookletMeta } from './printMarks';

const twoPageSpread = function (...arg) {
  return h(c('.spread-wrapper') + c('.two-page-size'), ...arg);
};
const onePageSpread = function (...arg) {
  return h(c('.spread-wrapper') + c('.page-size'), ...arg);
};


const renderPrintLayout = (pages, isTwoUp, orient, isBooklet) => {
  const printLayout = document.createDocumentFragment();

  const marks = isTwoUp ? printMarksSpread : printMarksSingle;
  const spread = isTwoUp ? twoPageSpread : onePageSpread;

  const printSheet = function (...arg) {
    return h(c('.print-page') + c(`.letter-${orient}`),
      spread(...arg, marks())
    );
  };

  if (isTwoUp) {
    for (let i = 0; i < pages.length; i += 2) {
      const sheet = printSheet(pages[i].element, pages[i + 1].element);
      printLayout.appendChild(sheet);
      if (isBooklet) {
        const meta = bookletMeta(i, pages.length);
        sheet.appendChild(meta);
      }
    }
  } else {
    pages.forEach((pg) => {
      const sheet = printSheet(pg.element);
      printLayout.appendChild(sheet);
    });
  }

  return printLayout;
};

export default renderPrintLayout;
