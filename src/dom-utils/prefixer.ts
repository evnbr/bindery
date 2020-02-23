//
// prefix classes
import { classPrefix } from '../constants';

const prefixer = (str: string) => {
  if (str[0] === '.') {
    return `.${classPrefix}${str.substr(1)}`;
  }
  return `${classPrefix}${str}`;
};

export default prefixer;
