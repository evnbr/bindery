// Convert units, via pixels, while making assumptions

// Inch assumptions
const inchPixels = 96;
const inchPoints = 72;
const inchMM     = 25.4;

// Number of pixels in one [unit]
const pxInOne = {
  px: 1,
  in: inchPixels,
  pt: 4 / 3,
  pc: 4 / 3 * 12,
  mm: inchMM / inchPixels,
  cm: inchMM / inchPixels * 10,
}

const unitToPx = (unitVal, unit)  => unitVal  * pxInOne[unit];
const pxToUnit = (pixelVal, unit) => pixelVal / pxInOne[unit];
const convert  = (val, from, to)  => pxToUnit(unitToPx(val, from), to);

export default convert;
