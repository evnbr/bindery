import { isLength } from '../css-length';
import validate from './validate';

const isObj = val => typeof val === 'object';
const isFunc = val => typeof val === 'function';
const isBool = val => typeof val === 'boolean';
const isStr = val => typeof val === 'string';
const isNum = val => typeof val === 'number';
const isArr = val => Array.isArray(val);

const hasProp = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);

const hasSameKeys = (opts, required) => {
  const keys = Object.keys(required).filter(k => k !== 'name');
  return !keys.some(k => !hasProp(opts, k));
};

const isShape = template => input => isObj(input) && validate(input, template);

const isShapeExact = template => input => isObj(input)
  && hasSameKeys(input, template)
  && validate(input, template);

const isEnum = cases => str => cases.includes(str);

const T = {
  any: {
    name: 'any',
    check: () => true,
  },
  enum(...cases) {
    return {
      name: `(${cases.map(c => `"${c}"`).join(' | ')})`,
      check: isEnum(cases),
    };
  },
  shapeExact: template => ({
    name: `exactly ({${Object.keys(template).join(', ')}})`,
    check: isShapeExact(template),
  }),
  shape: template => ({
    name: `shape ({${Object.keys(template).join(', ')}})`,
    check: isShape(template),
  }),
  string: {
    name: 'string',
    check: isStr,
  },
  length: {
    name: 'length (string with absolute units)',
    check: isLength,
  },
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
};

T.margin = {
  name: 'margin ({ top, inner, outer, bottom })',
  check: isShapeExact({
    name: 'margin',
    top: T.length,
    inner: T.length,
    outer: T.length,
    bottom: T.length,
  }),
};

T.size = {
  name: 'size ({ width, height })',
  check: isShapeExact({
    name: 'size',
    width: T.length,
    height: T.length,
  }),
};

export default T;
