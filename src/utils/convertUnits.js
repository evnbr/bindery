const cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;

const isValidLength = str => cssNumberRegEx.test(str);
const isValidSize = (size) => {
  Object.keys(size).forEach((k) => {
    if (!isValidLength(size[k])) {
      if (typeof size[k] === 'number') {
        throw Error(`Size is missing units { ${k}: ${size[k]} }`);
      } else {
        throw Error(`Invalid size { ${k}: ${size[k]} }`);
      }
    }
  });
};

const parseVal = (str) => {
  const matches = str.match(cssNumberRegEx);
  return {
    val: Number(matches[1]),
    unit: matches[3],
  };
};

export {
  parseVal,
  isValidLength,
  isValidSize,
};
