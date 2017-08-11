const indexOfNextInFlowPage = (pages, startIndex) => {
  for (let i = startIndex; i < pages.length; i += 1) {
    if (!pages[i].outOfFlow) {
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
      if (page.outOfFlow) {
        const indexToSwap = indexOfNextInFlowPage(pages, i);
        orderedPages[i] = orderedPages[indexToSwap];
        orderedPages[indexToSwap] = page;
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    } else if (!isLeft && page.alwaysLeft) {
      if (page.outOfFlow) {
        const indexToSwap = indexOfNextInFlowPage(pages, i);
        orderedPages[i] = orderedPages[indexToSwap];
        orderedPages[indexToSwap] = page;
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    }
  }

  return orderedPages;
};

export default orderPages;
