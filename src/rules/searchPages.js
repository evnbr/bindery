const pageNumbersForTest = (pages, test) =>
  pages.filter(pg => test(pg.element)).map(pg => pg.number);

const pageNumbersForSelector = (pages, sel) =>
  pageNumbersForTest(pages, el => el.querySelector(sel));

const formatAsRanges = (pageNumbers) => {
  let str = '';
  let prevNum = pageNumbers[0];
  let isInARange = false;

  const addFirst = (num) => {
    str += `${num}`;
  };
  const continueRange = () => {
    isInARange = true;
  };
  const endRange = (endNum) => {
    isInARange = false;
    str += `–${endNum}`;
  };
  const addComma = (num) => {
    str += `, ${num}`;
  };
  const endAndAdd = (endNum, num) => {
    endRange(endNum);
    addComma(num);
  };
  const addLast = (num, isAdjacent) => {
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
