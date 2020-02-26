import { PageMaker } from '../types';
import { Page } from "../book";

const indexOfNextReorderablePage = (pages: Page[], startIndex: number) => {
  for (let i = startIndex; i < pages.length; i += 1) {
    const pg = pages[i];
    if (!pg.isOutOfFlow && !pg.avoidReorder) return i;
  }
  return null;
};

// Given an array of pages with alwaysLeft, alwaysRight, and isOutOfFlow
// properties, orders them so that alwaysLeft and alwaysRight are true.

const orderPages = (pages: Page[], makeNewPage: PageMaker) => {
  const orderedPages = pages.slice();

  for (let i = 0; i < orderedPages.length; i += 1) {
    const page = orderedPages[i];
    const isLeft = i % 2 !== 0;

    if ((isLeft && page.alwaysRight) || (!isLeft && page.alwaysLeft)) {
      if (page.isOutOfFlow) {
        // If the page is 'out of flow', we'd prefer not to add a blank page.
        // Instead it floats backwards in the book, pulling the next
        // in-flow page forward. If several 'out of flow' pages
        // are next to each other, they will remain in order, all being pushed
        // backward together.

        const indexToSwap = indexOfNextReorderablePage(orderedPages, i + 1);
        if (!indexToSwap) {
          // No larger index to swap with, perhaps because
          // we are optimistically rendering before the book is done
          break;
        }
        const pageToMoveUp = orderedPages[indexToSwap];
        orderedPages.splice(indexToSwap, 1); // remove pg
        orderedPages.splice(i, 0, pageToMoveUp); // insert pg
      } else {
        // If the page is 'in flow', order must be respected, so extra blank pages
        // are inserted.
        orderedPages.splice(i, 0, makeNewPage());
      }
    }
  }
  return orderedPages;
};

export default orderPages;
