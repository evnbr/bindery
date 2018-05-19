import { isValidLength } from './convertUnits';

const validate = (opts, validOpts) => {
  let isValid = true;
  Object.keys(opts).forEach((k) => {
    if (!validOpts[k]) {
      console.error(`Bindery: '${validOpts.name}' doesn't have property '${k}'`);
      isValid = false;
    } else {
      const val = opts[k];
      const checker = validOpts[k];
      if (!checker(val)) {
        console.error(`Bindery: For property '${validOpts.name}.${k}', ${JSON.stringify(val)} is not a valid value of type ${checker.name}`);
        isValid = false;
      }
    }
  });
  return isValid;
};

const isObj = val => typeof val === 'object';
const isFunc = val => typeof val === 'function';
const isBool = val => typeof val === 'boolean';
const isStr = val => typeof val === 'string';
const isArr = val => Array.isArray(val);

const isShape = validShape => userShape => isObj(userShape) && validate(userShape, validShape);
const isMargin = val => isShape({
  name: 'margin',
  top: isValidLength,
  inner: isValidLength,
  outer: isValidLength,
  bottom: isValidLength,
})(val);
const isSize = val => isShape({
  name: 'size',
  width: isValidLength,
  height: isValidLength,
})(val);

const OptionType = {
  enum(...enumCases) {
    const enumCheck = function enumCheck(str) { return enumCases.includes(str); };
    Object.defineProperty(enumCheck, 'name', { writable: true });
    enumCheck.name = `enum ( '${enumCases.join('\' | \'')}' )`;
    return enumCheck;
  },
  any: () => true,
  string: isStr,
  length: isValidLength,
  bool: isBool,
  func: isFunc,
  obj: isObj,
  array: isArr,
  shape: isShape,
  margin: isMargin,
  size: isSize,
  validate,
};

export default OptionType;
