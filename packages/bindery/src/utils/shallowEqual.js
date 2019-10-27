// https://github.com/moroshko/shallow-equal/blob/master/src/arrays.js
const shallowEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;

  const len = a.length;

  if (b.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) return false;
  }

  return true;
};

export default shallowEqual;
