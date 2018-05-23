const cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;

const isLength = str => cssNumberRegEx.test(str);

const parseLength = (str) => {
  const matches = str.match(cssNumberRegEx);
  return {
    val: Number(matches[1]),
    unit: matches[3],
  };
};

export { parseLength, isLength };
