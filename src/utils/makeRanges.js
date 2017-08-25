const makeRanges = (arr) => {
  let str = '';
  let prevNum = arr[0];
  let isInARange = false;
  arr.forEach((num, i) => {
    const isLast = i === arr.length - 1;
    const isAdjacent = num === prevNum + 1;

    if (i === 0) {
      str += `${num}`;
    } else if (isLast) {
      if (isAdjacent) {
        str += `–${num}`;
      } else if (isInARange) {
        str += `–${prevNum}, ${num}`;
      } else {
        str += `, ${num}`;
      }
    } else if (isAdjacent) {
      isInARange = true;
    } else if (isInARange && !isAdjacent) {
      isInARange = false;
      str += `–${prevNum}, ${num}`;
    } else {
      str += `, ${num}`;
    }
    prevNum = num;
  });
  // return `${str} - [${arr}]`;
  return str;
};

export default makeRanges;
