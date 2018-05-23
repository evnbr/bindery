//
// prefix classes
const p = '📖-';

const prefix = str => `${p}${str}`;
const prefixClass = str => `.${prefix(str)}`;

const prefixer = (str) => {
  if (str[0] === '.') {
    return prefixClass(str.substr(1));
  }
  return prefix(str);
};

export default prefixer;
