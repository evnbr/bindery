import scheduler from '../Scheduler';
import shouldIgnoreOverflow from './shouldIgnoreOverflow';

// Try adding a text node in one go
const addTextNode = async (textNode, parent, page) => {
  parent.appendChild(textNode);
  const success = !page.hasOverflowed();
  if (!success) parent.removeChild(textNode);
  await scheduler.yieldIfNecessary();
  return success;
};

// Try adding a text node by incrementally adding words
// until it just barely doesnt overflow.
// Binary search would probably be better but its not currenty
// the bottleneck.
const addTextNodeIncremental = async (textNode, parent, page) => {
  const originalText = textNode.nodeValue;
  parent.appendChild(textNode);

  if (!page.hasOverflowed() || shouldIgnoreOverflow(parent)) {
    return true;
  }

  // Add letter by letter until overflow
  let pos = 0;
  textNode.nodeValue = originalText.substr(0, pos);

  while (!page.hasOverflowed() && pos < originalText.length) {
    // advance to next non-space character
    pos += 1;
    while (pos < originalText.length && originalText.charAt(pos) !== ' ') pos += 1;

    if (pos < originalText.length) {
      // reveal more text
      textNode.nodeValue = originalText.substr(0, pos);
      await scheduler.yieldIfNecessary();
    }
  }

  // Early return, we added the whole thing wastefully
  if (pos > originalText.length - 1) {
    return true;
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

  // Create a new text node for the next page
  const remainingTextNode = document.createTextNode(overflowingText);
  return remainingTextNode;
};

export { addTextNode, addTextNodeIncremental };
