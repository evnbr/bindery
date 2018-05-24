import { createEl } from '../dom-utils';
import { Page, orderPagesBooklet } from '../book';
import { printMarksSingle, printMarksSpread, bookletMeta } from './printMarks';
import padPages from './padPages';
import { Layout } from '../constants';

const twoPageSpread = children => createEl('.spread-wrapper.spread-size', children);
const onePageSpread = children => createEl('.spread-wrapper.page-size', children);

const renderPrintLayout = (bookPages, layout) => {
  const isTwoUp = layout !== Layout.PAGES;
  const isSpreads = layout === Layout.SPREADS;
  const isBooklet = layout === Layout.BOOKLET;

  let pages = bookPages;
  if (isSpreads) pages = padPages(pages, () => new Page());
  else if (isBooklet) pages = orderPagesBooklet(pages, () => new Page());

  const printLayout = document.createDocumentFragment();

  const marks = isTwoUp ? printMarksSpread : printMarksSingle;
  const spread = isTwoUp ? twoPageSpread : onePageSpread;

  const printSheet = children => createEl('.print-sheet', [spread(children)]);

  if (isTwoUp) {
    for (let i = 0; i < pages.length; i += 2) {
      const spreadMarks = marks();
      if (isBooklet) {
        const meta = bookletMeta(i, pages.length);
        spreadMarks.appendChild(meta);
      }
      const sheet = printSheet([
        pages[i].element,
        pages[i + 1].element,
        spreadMarks]);
      printLayout.appendChild(sheet);
    }
  } else {
    pages.forEach((pg) => {
      const sheet = printSheet([pg.element, marks()]);
      printLayout.appendChild(sheet);
    });
  }

  return printLayout;
};

export default renderPrintLayout;
