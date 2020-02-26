import Page from './Page';

const pageNumbersForTest = (pages: Page[], test: ((el: HTMLElement) => boolean)): number[] => {
  return pages
    .filter((pg) => !!pg.number)
    .filter((pg) => test(pg.element))
    .map((pg) => pg.number as number);
}

const pageNumbersForSelector = (pages: Page[], selector: string) => {
  return pageNumbersForTest(pages, (el: HTMLElement) => {
    return !!el.querySelector(selector)
  });
}

export { pageNumbersForTest, pageNumbersForSelector };
