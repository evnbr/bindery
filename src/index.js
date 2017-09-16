const Bindery = require('./bindery').default;
const Rules = require('./Rules').default;

const BinderyWithRules = Object.assign(Bindery, Rules);

module.exports = BinderyWithRules;
