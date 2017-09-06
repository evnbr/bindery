const validate = (opts, validOpts) => {
  Object.keys(opts).forEach((k) => {
    if (!validOpts[k]) {
      console.error(`Bindery: '${validOpts.name}' doesn't have option '${k}'`);
    } else {
      const val = opts[k];
      const checker = validOpts[k];
      if (!checker(val)) {
        console.error(`Bindery: In '${validOpts.name}.${k}', '${JSON.stringify(val)}' is not a valid ${checker.name}`);
      }
    }
  });
  return true;
};

const isObj = val => typeof val === 'object';

const UserOption = {
  enum(...enumCases) {
    return str => enumCases.includes(str);
  },
  any() {
    return true;
  },
  string(val) {
    return typeof val === 'string';
  },
  bool(val) {
    return typeof val === 'boolean';
  },
  func(val) {
    return typeof val === 'function';
  },
  obj: isObj,
  array(val) {
    return Array.isArray(val);
  },
  shape(validShape) {
    return userShape => isObj(userShape) && validate(userShape, validShape);
  },
  validate,
};

export default UserOption;
