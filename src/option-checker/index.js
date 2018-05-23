import { isLength } from '../css-length';
import validate from './validate';

const isObj = val => typeof val === 'object';
const isFunc = val => typeof val === 'function';
const isBool = val => typeof val === 'boolean';
const isStr = val => typeof val === 'string';
const isArr = val => Array.isArray(val);

const hasProp = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);

const hasSameKeys = (opts, required) => {
  const keys = Object.keys(required).filter(k => k !== 'name');
  return !keys.some(k => !hasProp(opts, k));
};

const isShape = template => userShape => isObj(userShape)
  && validate(userShape, template);

const isShapeExact = template => userShape => isObj(userShape)
  && hasSameKeys(userShape, template)
  && validate(userShape, template);

const isEnum = cases => str => cases.includes(str);

const T = {
  any: {
    name: 'any',
    check: () => true,
  },
  enum(...cases) {
    return {
      name: `("${cases.join('" | "')}")`,
      check: isEnum(cases),
    };
  },
  shapeExact: template => ({
    name: `exactly {${Object.keys(template).join(', ')}})`,
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

export { validate, T };
