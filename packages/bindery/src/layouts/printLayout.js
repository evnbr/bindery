import { createEl, classes } from '../dom-utils';
import { Page } from '../book';
import { Layout } from '../constants';

import { printMarksSingle, printMarksSpread, bookletMeta } from './printMarks';
import padPages from './padPages';
import orderPagesBooklet from './orderPagesBooklet';

const twoPageSpread = children => createEl('.spread-wrapper', children);
const onePageSpread = children => createEl('.spread-wrapper', children);

const renderPrintLayout = (bookPages, doubleSided, layout) => {
  const isTwoUp = layout !== Layout.PAGES;
  const isSpreads = layout === Layout.SPREADS;
  const isBooklet = layout === Layout.BOOKLET;

  let pages = bookPages;
  if (isSpreads) pages = padPages(pages, () => new Page());
  else if (isBooklet) pages = orderPagesBooklet(pages, () => new Page());

  const printLayout = document.createDocumentFragment();

  const marks = isTwoUp ? printMarksSpread : printMarksSingle;
  const spread = isTwoUp ? twoPageSpread : onePageSpread;

  const printSheet = children => createEl('print-sheet', [spread(children)]);

  if (isTwoUp) {
    for (let i = 0; i < pages.length; i += 2) {
      const spreadMarks = marks();
      if (isBooklet) {
        const meta = bookletMeta(i, pages.length);
        spreadMarks.appendChild(meta);
      }
      const sheet = printSheet([
        createEl('.page-bleed-clip.page-bleed-clip-left', [pages[i].getLastRenderedElement()]),
        createEl('.page-bleed-clip.page-bleed-clip-right', [pages[i + 1].getLastRenderedElement()]),
        spreadMarks]);
      sheet.classList.add(classes.sheetSpread);
      printLayout.appendChild(sheet);
    }
  } else {
    pages.forEach((pg) => {
      const sheet = printSheet([pg.getLastRenderedElement(), marks()]);
      sheet.classList.add(pg.isLeft ? classes.sheetLeft : classes.sheetRight);
      printLayout.appendChild(sheet);
    });
  }

  return printLayout;
};

export default renderPrintLayout;
