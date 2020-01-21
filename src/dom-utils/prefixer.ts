//
// prefix classes
const p = '📖-';

const prefix = (str: string) => `${p}${str}`;
const prefixClass = (str: string) => `.${prefix(str)}`;

const prefixer = (str: string) => {
  if (str[0] === '.') {
    return prefixClass(str.substr(1));
  }
  return prefix(str);
};

export default prefixer;
