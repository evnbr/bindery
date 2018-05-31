import { isTextNode, isUnloadedImage, isContentElement } from './nodeTypes';
import { ignoreOverflow } from './canSplit';
import { addTextNode, addTextNodeAcrossElements } from './addTextNode';
import tryInNextBox from './tryInNextBox';

// flow content through FlowBoxes.
// This function is not book-specific,
// the caller is responsible for managing
// and creating boxes.
const flowIntoBoxes = async (
  content,
  makeNextBox,
  applySplit,
  canSplitEl,
  transformsBeforeAdd,
  transformsAfterAdd,
) => {
  let currentBox = makeNextBox();
  const hasOverflowed = () => currentBox.hasOverflowed();
  const canSplitCurrent = () => canSplitEl(currentBox.currentElement);
  const ignoreCurrentOverflow = () => ignoreOverflow(currentBox.currentElement);

  const continueInNextBox = () => {
    const oldBox = currentBox;
    currentBox = makeNextBox();
    currentBox.continueFrom(oldBox, applySplit);
    return currentBox;
  };

  const continuedElement = () => {
    continueInNextBox();
    return currentBox.currentElement;
  };

  const addTextWithoutChecks = (textNode, parent) => {
    parent.appendChild(textNode);
    if (!ignoreCurrentOverflow() && canSplitCurrent()) {
      currentBox.suppressErrors = true;
      continueInNextBox();
    }
  };

  const addSplittableTextNode = async (textNode) => {
    const el = currentBox.currentElement;
    let hasAdded = await addTextNodeAcrossElements(textNode, el, continuedElement, hasOverflowed);
    if (!hasAdded && currentBox.path.length > 1) {
      // retry 1
      tryInNextBox(currentBox, continueInNextBox, canSplitEl);
      hasAdded = await addTextNodeAcrossElements(textNode, el, continuedElement, hasOverflowed);
    }
    if (!hasAdded) {
      // retry 2
      addTextWithoutChecks(textNode, currentBox.currentElement);
    }
  };

  const addWholeTextNode = async (textNode) => {
    let hasAdded = await addTextNode(textNode, currentBox.currentElement, hasOverflowed);
    if (!hasAdded && !ignoreCurrentOverflow()) {
      // retry 1
      tryInNextBox(currentBox, continueInNextBox, canSplitEl);
      hasAdded = await addTextNode(textNode, currentBox.currentElement, hasOverflowed);
    }
    if (!hasAdded) {
      // retry 2
      addTextWithoutChecks(textNode, currentBox.currentElement);
    }
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = async (elementToAdd) => {
    // Ensure images are loaded before measuring
    if (isUnloadedImage(elementToAdd)) await estimator.ensureImageLoaded(elementToAdd);

    // Transforms before adding
    const element = transformsBeforeAdd(elementToAdd, continueInNextBox);

    // Insert element
    currentBox.currentElement.appendChild(element);
    currentBox.path.push(element);

    // Clear element
    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    // Overflows when empty
    if (hasOverflowed() && !ignoreCurrentOverflow() && canSplitCurrent()) {
      tryInNextBox(currentBox, continueInNextBox, canSplitEl);
    }

    const shouldSplit = canSplitEl(element) && !ignoreOverflow(element);

    for (const child of childNodes) {
      if (isTextNode(child)) {
        await (shouldSplit ? addSplittableTextNode : addWholeTextNode)(child);
      } else if (isContentElement(child)) {
        await addElementNode(child);
      } else {
        // Skip comments and unknown nodes
      }
    }

    // Transforms after adding
    const addedElement = currentBox.path.pop();
    transformsAfterAdd(addedElement, continueInNextBox);
  };

  return addElementNode(content);
};

export default flowIntoBoxes;
