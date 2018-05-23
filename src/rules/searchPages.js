const pageNumbersForTest = (pages, test) =>
  pages.filter(pg => test(pg.element)).map(pg => pg.number);

const pageNumbersForSelector = (pages, sel) =>
  pageNumbersForTest(pages, el => el.querySelector(sel));

export { pageNumbersForTest, pageNumbersForSelector };
