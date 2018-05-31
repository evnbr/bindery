const overflowAttr = 'data-ignore-overflow';
// Walk up the tree to see if we are within
// an overflow-ignoring node
const ignoreOverflow = (element) => {
  if (element.hasAttribute(overflowAttr)) return true;
  if (element.parentElement) return ignoreOverflow(element.parentElement);
  return false;
};

export default ignoreOverflow;
