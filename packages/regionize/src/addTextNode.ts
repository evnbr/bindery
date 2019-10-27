import { yieldIfNecessary } from './schedule';
import ignoreOverflow from './ignoreOverflow';
import { ElementGetter } from './types';
import { nextWordEnd, previousWordEnd } from './stringUtils';

type Checker = () => boolean;

export type TextLayoutResult = {
  completed: boolean,
  remainder?: Text,
  waitTime?: number,
}

const createTextNode: (text: string) => Text = (document.createTextNode).bind(document);

// Try adding a text node in one go.
// Returns true if all the text fits, false if none fits.
const addInOneGo = async (
  textNode: Text,
  container: HTMLElement,
  hasOverflowed: Checker
): Promise<TextLayoutResult> => {
  container.appendChild(textNode);
  const success = !hasOverflowed();
  if (!success) container.removeChild(textNode);
  await yieldIfNecessary();
  return { completed: success };
};

// Incrementally add words to the container until it just barely doesnt
// overflow. Returns a remainder textNode for remaining text.
const fillWordsUntilOverflow = async (
  textNode: Text,
  container: HTMLElement,
  hasOverflowed: Checker
): Promise<TextLayoutResult> => {
  const originalText = textNode.nodeValue || '';
  container.appendChild(textNode);

  if (!hasOverflowed() || ignoreOverflow(container)) {
    // The whole thing fits
    return { completed: true };
  }

  // Clear the node
  let proposedEnd = 0;
  textNode.nodeValue = originalText.substr(0, proposedEnd);

  while (!hasOverflowed() && proposedEnd < originalText.length) {
    // Reveal the next word
    proposedEnd = nextWordEnd(originalText, proposedEnd)

    if (proposedEnd < originalText.length) {
      textNode.nodeValue = originalText.substr(0, proposedEnd);
      await yieldIfNecessary();
    }
  }

  // Back out to word boundary
  const wordEnd = previousWordEnd(originalText, proposedEnd);

  if (wordEnd < 1) {
    // We didn't even add a complete word, don't add node
    textNode.nodeValue = originalText;
    container.removeChild(textNode);
    return { completed: false };
  }

  // trim text to word
  const fittingText = originalText.substr(0, wordEnd);
  const overflowingText = originalText.substr(wordEnd);
  textNode.nodeValue = fittingText;

  // Create a new text node for the next flow box
  return {
    completed: true,
    remainder: createTextNode(overflowingText)
  };
};


// Fills text across multiple elements by requesting a continuation
// once the current element overflows
const fillWords = async (
  textNode: Text,
  container: HTMLElement,
  getNextContainer: ElementGetter,
  hasOverflowed: Checker
): Promise<TextLayoutResult> => {
  const textLayout = await fillWordsUntilOverflow(textNode, container, hasOverflowed);

  if (textLayout.remainder) {
    const nextContainer = getNextContainer();
    return fillWords(
      textLayout.remainder,
      nextContainer,
      getNextContainer,
      hasOverflowed
    );
  }

  return textLayout;
};

export {
  addInOneGo as addTextNode,
  fillWords as addSplittableText,
  fillWordsUntilOverflow
};
