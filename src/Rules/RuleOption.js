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
};

export default RuleOption;
