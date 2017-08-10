const arraysEqual = (a, b) => {
  if (a.length !== b.length) { return false; }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) { return false; }
  }
  return true;
};

export default arraysEqual;
