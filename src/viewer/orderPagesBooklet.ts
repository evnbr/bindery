import { Page } from '../book';
import { PageMaker } from '../types';

const orderPagesBooklet = (pages: Page[], makePage: PageMaker) => {
  while (pages.length % 4 !== 0) {
    const spacerPage = makePage();
    spacerPage.element.style.visibility = 'hidden';
    pages.push(spacerPage);
  }
  const bookletOrder: Page[] = [];
  const len = pages.length;

  for (let i = 0; i < len / 2; i += 2) {
    bookletOrder.push(pages[len - 1 - i]);
    bookletOrder.push(pages[i]);
    bookletOrder.push(pages[i + 1]);
    bookletOrder.push(pages[len - 2 - i]);
  }

  return bookletOrder;
};

export default orderPagesBooklet;
