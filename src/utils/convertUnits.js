const cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;

const isValidLength = str => cssNumberRegEx.test(str);

const parseVal = (str) => {
  const matches = str.match(cssNumberRegEx);
  return {
    val: Number(matches[1]),
    unit: matches[3],
  };
};

export { parseVal, isValidLength };
