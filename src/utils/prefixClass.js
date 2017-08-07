// const p = 'bindery-';
const p = '📖-';

const prefix = str => `${p}${str}`;
const prefixClass = str => `.${prefix(str)}`;

const c = (str) => {
  if (str[0] === '.') {
    return prefixClass(str.substr(1));
  }
  return prefix(str);
};

export default c;
