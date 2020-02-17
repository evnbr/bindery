import { Page } from '../book';

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

const formatAsRanges = (pageNumbers: number[]) => {
  let str = '';
  let prevNum = pageNumbers[0];
  let isInARange = false;

  const addFirst = (num: number) => {
    str += `${num}`;
  };
  const continueRange = () => {
    isInARange = true;
  };
  const endRange = (endNum: number) => {
    isInARange = false;
    str += `–${endNum}`;
  };
  const addComma = (num: number) => {
    str += `, ${num}`;
  };
  const endAndAdd = (endNum: number, num: number) => {
    endRange(endNum);
    addComma(num);
  };
  const addLast = (num: number, isAdjacent: boolean) => {
    if (isAdjacent) endRange(num);
    else if (isInARange && !isAdjacent) endAndAdd(prevNum, num);
    else addComma(num);
  };

  pageNumbers.forEach((num, i) => {
    const isLast = i === pageNumbers.length - 1;
    const isAdjacent = num === prevNum + 1;

    if (i === 0) addFirst(num);
    else if (isLast) addLast(num, isAdjacent);
    else if (isAdjacent) continueRange();
    else if (isInARange && !isAdjacent) endAndAdd(prevNum, num);
    else addComma(num);
    prevNum = num;
  });
  return str;
};

export { pageNumbersForTest, pageNumbersForSelector, formatAsRanges };
