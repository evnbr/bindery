// Shifts this element to the next page. If any of its
// ancestors cannot be split across page, it will
// step up the tree to find the first ancestor
// that can be split, and move all of that descendants
// to the next page.
const tryInNextRegion = (region, makeNextRegion, canSplitElement) => {
  if (region.path.length <= 1) {
    throw Error('Bindery: Attempting to move the top-level element');
  }
  const startLength = region.path.length;

  // So this node won't get cloned. TODO: this is unclear
  const elementToMove = region.path.pop();

  // find the nearest splittable parent
  let nearestElementThatCanBeMoved = elementToMove;
  const pathToRestore = [];
  while (region.path.length > 1 && !canSplitElement(region.currentElement)) {
    nearestElementThatCanBeMoved = region.path.pop();
    pathToRestore.unshift(nearestElementThatCanBeMoved);
  }

  // Once a node is moved to a new page, it should no longer trigger another
  // move. otherwise tall elements will endlessly get shifted to the next page
  nearestElementThatCanBeMoved.setAttribute('data-bindery-did-move', true);

  const parent = nearestElementThatCanBeMoved.parentNode;
  parent.removeChild(nearestElementThatCanBeMoved);

  // If the nearest ancestor would be empty without this node,
  // move it to the next page too.
  if (region.path.length > 1 && region.currentElement.textContent.trim() === '') {
    parent.appendChild(nearestElementThatCanBeMoved);
    nearestElementThatCanBeMoved = region.path.pop();
    pathToRestore.unshift(nearestElementThatCanBeMoved);
    nearestElementThatCanBeMoved.parentNode.removeChild(nearestElementThatCanBeMoved);
  }

  let nextRegion;
  if (!region.isEmpty) {
    if (region.hasOverflowed()) {
      // Recovery failed, maybe the box contains a large
      // unsplittable element.
      region.suppressErrors = true;
    }
    nextRegion = makeNextRegion();
  } else {
    // If the page is empty when this node is removed,
    // then it won't help to move it to the next page.
    // Instead continue here until the node is done.
    nextRegion = region;
  }

  // append moved node as first in new page
  nextRegion.currentElement.appendChild(nearestElementThatCanBeMoved);

  // restore subpath
  pathToRestore.forEach(r => nextRegion.path.push(r));
  nextRegion.path.push(elementToMove);

  if (startLength !== nextRegion.path.length) {
    throw Error('Restored flowpath depth does not match original depth');
  }
};

export default tryInNextRegion;
