import { isLength } from '../css-length';
import validateRuntimeOptions from './validate';

const isObj  = (val: any) => typeof val === 'object';
const isFunc = (val: any) => typeof val === 'function';
const isBool = (val: any) => typeof val === 'boolean';
const isStr  = (val: any) => typeof val === 'string';
const isNum  = (val: any) => typeof val === 'number';
const isArr  = (val: any) => Array.isArray(val);

const hasProp = (obj: {}, k: string) => Object.prototype.hasOwnProperty.call(obj, k);

const hasSameKeys = (opts: {}, required: {}) => {
  const keys = Object.keys(required).filter(k => k !== 'name');
  return !keys.some(k => !hasProp(opts, k));
};

const isShape = (template: {}) => {
  return (input: any) => {
    return isObj(input) && validateRuntimeOptions(input, template);
  }
}

const isShapeExact = (template: {}) => {
  return (input: any) => {
    return isObj(input)
    && hasSameKeys(input, template)
    && validateRuntimeOptions(input, template);
  }
}

const isEnum = (cases: string[]) => {
  return (str: string) => {
    return cases.includes(str);
  }
}

const lengthChecker = {
  name: 'length (string with absolute units)',
  check: isLength,
};

const T = {
  any: {
    name: 'any',
    check: () => true,
  },
  enum(...cases: string[]) {
    return {
      name: `(${cases.map(c => `"${c}"`).join(' | ')})`,
      check: isEnum(cases),
    };
  },
  shapeExact: (template: {}) => ({
    name: `exactly ({${Object.keys(template).join(', ')}})`,
    check: isShapeExact(template),
  }),
  shape: (template: {}) => ({
    name: `shape ({${Object.keys(template).join(', ')}})`,
    check: isShape(template),
  }),
  string: {
    name: 'string',
    check: isStr,
  },
  length: lengthChecker,
  number: {
    name: 'number',
    check: isNum,
  },
  bool: {
    name: 'bool',
    check: isBool,
  },
  func: {
    name: 'func',
    check: isFunc,
  },
  obj: {
    name: 'object',
    check: isObj,
  },
  array: {
    name: 'array',
    check: isArr,
  },
  margin: {
    name: 'margin ({ top, inner, outer, bottom })',
    check: isShapeExact({
      name: 'margin',
      top: lengthChecker,
      inner: lengthChecker,
      outer: lengthChecker,
      bottom: lengthChecker,
    }),
  },
  size: {
    name: 'size ({ width, height })',
    check: isShapeExact({
      name: 'size',
      width: lengthChecker,
      height: lengthChecker,
    }),
  }
};

export default RuntimeTypes;
