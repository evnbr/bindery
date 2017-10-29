// TODO: Combine isSplittable and shouldIgnoreOverflow
// Walk up the tree to see if we are within
// an overflow-ignoring node
const shouldIgnoreOverflow = (element) => {
  if (element.hasAttribute('data-ignore-overflow')) return true;
  if (element.parentElement) return shouldIgnoreOverflow(element.parentElement);
  return false;
};

export default shouldIgnoreOverflow;
