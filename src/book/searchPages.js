const pageNumbersForTest = (pages, test) =>
  pages.filter(pg => test(pg.element)).map(pg => pg.number);

const pageNumbersForSelector = (pages, sel) =>
  pageNumbersForTest(pages, pg => pg.element.querySelector(sel));

export { pageNumbersForTest, pageNumbersForSelector };
