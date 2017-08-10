const orderPages = (pages, makeNewPage) => {
  const orderedPages = pages.slice();

  // TODO: this ignores the cover page, assuming its on the right
  for (let i = 1; i < orderedPages.length - 1; i += 2) {
    const left = orderedPages[i];

    // TODO: Check more than once
    if (left.alwaysRight) {
      if (left.outOfFlow) {
        orderedPages[i] = pages[i + 1];
        orderedPages[i + 1] = left;
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    }

    const right = orderedPages[i + 1];

    if (right.alwaysLeft) {
      if (right.outOfFlow) {
        // TODO: don't overflow, assumes that
        // there are not multiple spreads in a row
        orderedPages[i + 1] = pages[i + 3];
        orderedPages[i + 3] = right;
      } else {
        orderedPages.splice(i + 1, 0, makeNewPage());
      }
    }
  }

  return orderedPages;
};

export default orderPages;
