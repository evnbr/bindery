//
// prefix classes
const prefix = '📖-';

const prefixer = (str: string) => {
  if (str[0] === '.') {
    return `.${prefix}${str.substr(1)}`;
  }
  return `${prefix}${str}`;
};

export default prefixer;
