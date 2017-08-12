// Convert units, via pixels, while making assumptions

// Inch assumptions
const inchPixels = 96;
// const inchPoints = 72;
const inchMM = 25.4;

// Number of pixels in one [unit]
const pxInOne = {
  px: 1,
  in: inchPixels,
  pt: 4 / 3,
  pc: (4 / 3) * 12,
  mm: inchMM / inchPixels,
  cm: (inchMM / inchPixels) * 10,
};

const unitToPx = (unitVal, unit) => unitVal * pxInOne[unit];
const pxToUnit = (pixelVal, unit) => pixelVal / pxInOne[unit];
const convert = (val, from, to) => pxToUnit(unitToPx(val, from), to);

// const isValidRegEx = /^[+-]?[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)$/;
const cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;
const cssNumberPattern = '^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$';

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

const convertStrToPx = (str) => {
  const parts = parseVal(str);
  return unitToPx(parts.val, parts.unit);
};

const convertStrToStr = (str, to) => {
  const parts = parseVal(str);
  return `${pxToUnit(unitToPx(parts.val, parts.unit), to)}${to}`;
};

export {
  cssNumberPattern,
  parseVal,
  isValidLength,
  isValidSize,
  convert,
  convertStrToStr,
  convertStrToPx,
};
