import { classes } from '../dom-utils';

const overflowAttr = 'data-ignore-overflow';
const didMoveAttr = 'data-bindery-did-move';

// Walk up the tree to see if we are within
// an overflow-ignoring node
const ignoreOverflow = (element) => {
  if (element.hasAttribute(overflowAttr)) return true;
  if (element.parentElement) return ignoreOverflow(element.parentElement);
  return false;
};

// Walk up the tree to see if we can safely
// insert a split into this node.
const canSplit = (element, selectors) => {
  if (selectors.some(sel => element.matches(sel))) {
    // if (element.hasAttribute(didMoveAttr) || element.classList.contains(classes.fromPrev)) {
    //   return true; // ignore rules and split it anyways.
    // }
    return false;
  }
  if (element.parentElement) return canSplit(element.parentElement, selectors);
  return true;
};

export { ignoreOverflow, canSplit };
