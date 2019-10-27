// Shifts this element to the next page. If any of its
// ancestors cannot be split across page, it will
// step up the tree to find the first ancestor
// that can be split, and move all of that descendants
// to the next page.

import Region from './Region';
import { RegionGetter, ElementChecker } from './types';

const tryInNextRegion = (region: Region, makeNextRegion: RegionGetter, canSplit: ElementChecker) => {
  if (region.path.length <= 1) {
    throw Error('Regionize: Attempting to move the top-level element');
  }
  const startLength = region.path.length;

  // So this node won't get cloned. TODO: this is unclear
  const elementToMove = region.path.pop()!;

  // find the nearest splittable parent
  let nearestMoveableElement = elementToMove;
  const pathToRestore = [];
  while (region.path.length > 1 && !canSplit(region.currentElement)) {
    nearestMoveableElement = region.path.pop()!;
    pathToRestore.unshift(nearestMoveableElement);
  }

  // Once a node is moved to a new page, it should no longer trigger another
  // move. otherwise tall elements will endlessly get shifted to the next page
  nearestMoveableElement.setAttribute('data-bindery-did-move', 'true');

  const parent = nearestMoveableElement.parentNode;
  parent!.removeChild(nearestMoveableElement);

  // If the nearest ancestor would be empty without this node,
  // move it to the next page too.
  if (region.path.length > 1 && region.currentElement.textContent!.trim() === '') {
    parent!.appendChild(nearestMoveableElement);
    nearestMoveableElement = region.path.pop()!;
    pathToRestore.unshift(nearestMoveableElement);
    nearestMoveableElement.parentNode!.removeChild(nearestMoveableElement);
  }

  let nextRegion: Region;
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
  nextRegion.currentElement.appendChild(nearestMoveableElement);

  // restore subpath
  pathToRestore.forEach(r => nextRegion.path.push(r));
  nextRegion.path.push(elementToMove);

  if (startLength !== nextRegion.path.length) {
    throw Error('Regionize: Restored path depth does not match original path depth');
  }
};

export default tryInNextRegion;
