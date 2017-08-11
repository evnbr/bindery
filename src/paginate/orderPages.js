const indexOfNextInFlowPage = (pages, startIndex) => {
  for (let i = startIndex; i < pages.length; i += 1) {
    if (!pages[i].isOutOfFlow) {
      return i;
    }
  }
  return startIndex;
};

const orderPages = (pages, makeNewPage) => {
  const orderedPages = pages.slice();

  for (let i = 0; i < orderedPages.length; i += 1) {
    const page = orderedPages[i];
    const isLeft = i % 2 !== 0;

    if (isLeft && page.alwaysRight) {
      if (page.isOutOfFlow) {
        const indexToSwap = indexOfNextInFlowPage(orderedPages, i + 1);
        const pageToMoveUp = orderedPages[indexToSwap];
        orderedPages.splice(indexToSwap, 1);
        orderedPages.splice(i, 0, pageToMoveUp);
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    } else if (!isLeft && page.alwaysLeft) {
      if (page.isOutOfFlow) {
        const indexToSwap = indexOfNextInFlowPage(orderedPages, i + 1);
        const pageToMoveUp = orderedPages[indexToSwap];
        orderedPages.splice(indexToSwap, 1);
        orderedPages.splice(i, 0, pageToMoveUp);
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    }
  }
  return orderedPages;
};

export default orderPages;
