const indexOfNextInFlowPage = (pages, startIndex) => {
  for (let i = startIndex; i < pages.length; i += 1) {
    if (!pages[i].isOutOfFlow) return i;
  }
  return startIndex;
};

// Given an array of pages with alwaysLeft, alwaysRight, and isOutOfFlow
// properties, orders them so that alwaysLeft and alwaysRight are true.

const orderPages = (pages, makeNewPage) => {
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

        const indexToSwap = indexOfNextInFlowPage(orderedPages, i + 1);
        const pageToMoveUp = orderedPages[indexToSwap];
        orderedPages.splice(indexToSwap, 1);
        orderedPages.splice(i, 0, pageToMoveUp);
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
