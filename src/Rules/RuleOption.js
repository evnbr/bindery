const RuleOption = {
  enum(...enumCases) {
    return str => enumCases.includes(str);
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
  validate(opts, validOpts) {
    Object.keys(opts).forEach((k) => {
      if (!validOpts[k]) {
        console.error(`Bindery: Rule '${opts.name}' doesn't have an option '${k}'`);
      } else {
        const val = opts[k];
        if (!validOpts[k](val)) {
          console.error(`Bindery: In Rule '${opts.name}', '${val}' is not a valid value for '${k}'`);
        }
      }
    });
  },
};

export default RuleOption;
