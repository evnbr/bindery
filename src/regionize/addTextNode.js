import { yieldIfNecessary } from './schedule';
import ignoreOverflow from './ignoreOverflow';
import { isTextNode } from './nodeTypes';

const createTextNode = (document.createTextNode).bind(document);

// Try adding a text node in one go.
// Returns true if all the text fits, false if none fits.
const addTextNode = async (textNode, parent, hasOverflowed) => {
  parent.appendChild(textNode);
  const success = !hasOverflowed();
  if (!success) parent.removeChild(textNode);
  await yieldIfNecessary();
  return success;
};


// Try adding a text node by incrementally adding words
// until it just barely doesnt overflow.
//
// Returns true if all the text fits, false if none fits,
// or new textnode containing the remainder text.
const addTextNodeUntilOverflow = async (textNode, parent, hasOverflowed) => {
  const originalText = textNode.nodeValue;
  parent.appendChild(textNode);

  if (!hasOverflowed() || ignoreOverflow(parent)) {
    return true;
  }

  // Add letter by letter until overflow
  let pos = 0;
  textNode.nodeValue = originalText.substr(0, pos);

  while (!hasOverflowed() && pos < originalText.length) {
    // advance to next non-space character
    pos += 1;
    while (pos < originalText.length && originalText.charAt(pos) !== ' ') pos += 1;

    if (pos < originalText.length) {
      // reveal more text
      textNode.nodeValue = originalText.substr(0, pos);
      await yieldIfNecessary();
    }
  }

  // Back out to word boundary
  if (originalText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
  while (originalText.charAt(pos) !== ' ' && pos > 0) pos -= 1;

  if (pos < 1) {
    // We didn't even add a complete word, don't add node
    textNode.nodeValue = originalText;
    parent.removeChild(textNode);
    return false; // TODO
  }

  // trim text to word
  const fittingText = originalText.substr(0, pos);
  const overflowingText = originalText.substr(pos);
  textNode.nodeValue = fittingText;

  // Create a new text node for the next flow box
  const remainingTextNode = createTextNode(overflowingText);
  return remainingTextNode;
};


// Fills text across multiple elements by requesting a continuation
// once the current element overflows
const addTextNodeAcrossParents = async (textNode, parent, nextParent, hasOverflowed) => {
  const result = await addTextNodeUntilOverflow(textNode, parent, hasOverflowed);
  if (isTextNode(result)) {
    const nextElement = nextParent();
    return addTextNodeAcrossParents(result, nextElement, nextParent, hasOverflowed);
  }
  return result;
};

export { addTextNode, addTextNodeUntilOverflow, addTextNodeAcrossParents };
