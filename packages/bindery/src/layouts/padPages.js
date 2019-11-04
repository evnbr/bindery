const padPages = (pages, makePage) => {
  if (pages.length % 2 !== 0) {
    const pg = makePage();
    pages.push(pg);
  }
  const spacerPage = makePage({ isSpacer: true });
  const spacerPage2 = makePage({ isSpacer: true });
  pages.unshift(spacerPage);
  pages.push(spacerPage2);

  return pages;
};

export default padPages;
