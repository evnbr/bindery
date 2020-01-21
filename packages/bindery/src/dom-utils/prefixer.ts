//
// prefix classes
const p = '📖-';

const prefix = (str: String) => `${p}${str}`;
const prefixClass = (str: String) => `.${prefix(str)}`;

const prefixer = (str: String) => {
  if (str[0] === '.') {
    return prefixClass(str.substr(1));
  }
  return prefix(str);
};

export default prefixer;
