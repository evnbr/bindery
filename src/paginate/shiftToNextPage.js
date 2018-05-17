// Shifts this element to the next page. If any of its
// ancestors cannot be split across page, it will
// step up the tree to find the first ancestor
// that can be split, and move all of that descendants
// to the next page.
const shiftToNextPage = (page, continueOnNewPage, canSplitElement) => {
  // So this node won't get cloned. TODO: this is unclear
  const elementToMove = page.breadcrumb.pop();

  if (page.breadcrumb.length < 1) {
    throw Error('Bindery: Attempting to move the top-level element');
  }

  // find the nearest splittable parent
  let nearestElementThatCanBeMoved = elementToMove;
  const pathToRestore = [];
  while (page.breadcrumb.length > 1 && !canSplitElement(page.currentElement)) {
    nearestElementThatCanBeMoved = page.breadcrumb.pop();
    pathToRestore.unshift(nearestElementThatCanBeMoved);
  }

  // Once a node is moved to a new page, it should no longer trigger another
  // move. otherwise tall elements will endlessly get shifted to the next page
  nearestElementThatCanBeMoved.setAttribute('data-bindery-did-move', true);

  const parent = nearestElementThatCanBeMoved.parentNode;
  parent.removeChild(nearestElementThatCanBeMoved);

  // If the nearest ancestor would be empty without this node,
  // move it to the next page too.
  if (page.breadcrumb.length > 1 && page.currentElement.textContent.trim() === '') {
    parent.appendChild(nearestElementThatCanBeMoved);
    nearestElementThatCanBeMoved = page.breadcrumb.pop();
    pathToRestore.unshift(nearestElementThatCanBeMoved);
    nearestElementThatCanBeMoved.parentNode.removeChild(nearestElementThatCanBeMoved);
  }

  let newPage;
  if (!page.isEmpty) {
    if (page.hasOverflowed()) page.suppressErrors = true;
    newPage = continueOnNewPage();
  } else {
    // If the page is empty when this node is removed,
    // then it won't help to move it to the next page.
    // Instead continue here until the node is done.
    newPage = page;
  }

  // append moved node as first in new page
  newPage.currentElement.appendChild(nearestElementThatCanBeMoved);

  // restore subpath
  pathToRestore.forEach(r => newPage.breadcrumb.push(r));
  newPage.breadcrumb.push(elementToMove);
};

export default shiftToNextPage;
