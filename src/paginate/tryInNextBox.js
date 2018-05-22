// Shifts this element to the next page. If any of its
// ancestors cannot be split across page, it will
// step up the tree to find the first ancestor
// that can be split, and move all of that descendants
// to the next page.
const tryInNextBox = (flow, makeNextFlow, canSplitElement) => {
  // So this node won't get cloned. TODO: this is unclear
  const elementToMove = flow.path.pop();

  if (flow.path.length < 1) {
    throw Error('Bindery: Attempting to move the top-level element');
  }

  // find the nearest splittable parent
  let nearestElementThatCanBeMoved = elementToMove;
  const pathToRestore = [];
  while (flow.path.length > 1 && !canSplitElement(flow.currentElement)) {
    nearestElementThatCanBeMoved = flow.path.pop();
    pathToRestore.unshift(nearestElementThatCanBeMoved);
  }

  // Once a node is moved to a new page, it should no longer trigger another
  // move. otherwise tall elements will endlessly get shifted to the next page
  nearestElementThatCanBeMoved.setAttribute('data-bindery-did-move', true);

  const parent = nearestElementThatCanBeMoved.parentNode;
  parent.removeChild(nearestElementThatCanBeMoved);

  // If the nearest ancestor would be empty without this node,
  // move it to the next page too.
  if (flow.path.length > 1 && flow.currentElement.textContent.trim() === '') {
    parent.appendChild(nearestElementThatCanBeMoved);
    nearestElementThatCanBeMoved = flow.path.pop();
    pathToRestore.unshift(nearestElementThatCanBeMoved);
    nearestElementThatCanBeMoved.parentNode.removeChild(nearestElementThatCanBeMoved);
  }

  let newFlow;
  if (!flow.isEmpty) {
    if (flow.hasOverflowed()) flow.suppressErrors = true;
    newFlow = makeNextFlow();
  } else {
    // If the page is empty when this node is removed,
    // then it won't help to move it to the next page.
    // Instead continue here until the node is done.
    newFlow = flow;
  }

  // append moved node as first in new page
  newFlow.currentElement.appendChild(nearestElementThatCanBeMoved);

  // restore subpath
  pathToRestore.forEach(r => newFlow.path.push(r));
  newFlow.path.push(elementToMove);
};

export default tryInNextBox;
