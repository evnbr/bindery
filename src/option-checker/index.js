import { isValidLength } from '../utils';
import validate from './validate';

const isObj = val => typeof val === 'object';
const isFunc = val => typeof val === 'function';
const isBool = val => typeof val === 'boolean';
const isStr = val => typeof val === 'string';
const isArr = val => Array.isArray(val);

const hasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
const hasSameKeys = (opts, required) => {
  const keys = Object.keys(required).filter(k => k !== 'name');
  return !keys.some(k => !hasProp(opts, k));
};

const isShape = validShape => userShape => isObj(userShape)
  && hasSameKeys(userShape, validShape)
  && validate(userShape, validShape);

const isEnum = cases => str => cases.includes(str);

const T = {
  any: () => true,
  enum(...cases) {
    return {
      name: `('${cases.join('\' or \'')}')`,
      check: isEnum(cases),
    };
  },
  shape: template => ({
    name: 'shape',
    check: isShape(template),
  }),
  string: {
    name: 'string',
    check: isStr,
  },
  length: {
    name: 'length (with absolute units)',
    check: isValidLength,
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

const isSize = val => isShape({
  name: 'size',
  width: T.length,
  height: T.length,
})(val);

T.margin = {
  name: 'margin',
  check: isShape({
    name: 'margin',
    top: T.length,
    inner: T.length,
    outer: T.length,
    bottom: T.length,
  }),
};

T.size = {
  name: 'size',
  check: isSize,
};

export { validate, T };
