import { ElementCloner, ElementChecker, RuleApplier, RegionGetter } from './types';
import { isTextNode, isUnloadedImage, isContentElement } from './typeGuards';

import { addTextNode, addSplittableText, TextLayoutResult } from './addTextNode';
import tryInNextRegion from './tryInNextRegion';
import shouldIgnoreOverflow from './shouldIgnoreOverflow';
import clonePath from './clonePath';
import ensureImageLoaded from './ensureImageLoaded';
import orderedListRule from './orderedListRule';
import tableRowRule from './tableRowRule';
import Region from './Region';

type AddElementResult = Promise<HTMLElement>;

interface FlowOptions {
  content: HTMLElement,
  createRegion: RegionGetter,
  applySplit?: RuleApplier,
  canSplit?: ElementChecker,
  shouldTraverse?: ElementChecker,
  beforeAdd?: (el: HTMLElement, next: RegionGetter) => void,
  afterAdd?: (el: HTMLElement, next: RegionGetter) => void,
  didWaitFor?: (t: number) => void,
}

const noop = () => {};
const always = () => true;
const never = () => false;

// flow content through FlowBoxes.
// the caller is responsible for managing
// and creating regions.
const flowIntoRegions = async (opts: FlowOptions) => {
  const content = opts.content;
  const createRegion = opts.createRegion;
  if (!content) throw Error('content not specified');
  if (!createRegion) throw Error('createRegion not specified');

  // optional
  const additionallyCustomizeSplit = opts.applySplit || noop;
  const canSplit = opts.canSplit || always;
  const prepareToAdd = opts.beforeAdd || noop;
  const finishAdding = opts.afterAdd || noop;
  const recordTimestamp = opts.didWaitFor || noop;
  const shouldTraverse = opts.shouldTraverse || never;

  // currentRegion should hold the only state that persists during traversal.
  let currentRegion = createRegion();
  const hasOverflowed = () => currentRegion.hasOverflowed();
  const canSplitCurrent = () => canSplit(currentRegion.currentElement);
  const shouldIgnoreOverflowOfCurrentRegion = () => shouldIgnoreOverflow(currentRegion.currentElement);

  const customizeSplit = (
    original: HTMLElement,
    clone: HTMLElement,
    nextChild?: HTMLElement,
    deepClone?: ElementCloner
  ) => {
    if (original.tagName === 'OL') {
      orderedListRule(original, clone, nextChild);
    }
    if (original.tagName === 'TR' && nextChild && deepClone) {
      tableRowRule(original, clone, nextChild, deepClone);
    }
    additionallyCustomizeSplit(original, clone, nextChild, deepClone);
  };

  const continueInNextRegion = (): Region => {
    const prevRegion = currentRegion;
    currentRegion = createRegion();

    const newPath = clonePath(prevRegion.path, customizeSplit);
    currentRegion.setPath(newPath);
    return currentRegion;
  };

  const continuedParent = (): HTMLElement => {
    continueInNextRegion();
    return currentRegion.currentElement;
  };

  const addText = async (textNode: Text, isSplittable: boolean) => {
    const el = currentRegion.currentElement;
    let result: TextLayoutResult;

    if (isSplittable) {
      // Add the text word by word, adding pages as needed
      result = await addSplittableText(textNode, el, continuedParent, hasOverflowed);
      if (!result.completed && currentRegion.path.length > 1) {
        tryInNextRegion(currentRegion, continueInNextRegion, canSplit);
        result = await addSplittableText(textNode, el, continuedParent, hasOverflowed);
      }
    }
    else {
      // Add the text as a block, trying a new page if needed
      result = await addTextNode(textNode, currentRegion.currentElement, hasOverflowed);
      if (!result.completed && !shouldIgnoreOverflowOfCurrentRegion()) {
        tryInNextRegion(currentRegion, continueInNextRegion, canSplit);
        result = await addTextNode(textNode, currentRegion.currentElement, hasOverflowed);
      }
    }

    // Something went wrong. Insert the text anyways, ignoring overflow,
    // and move onto the next region.
    if (!result.completed) {
      currentRegion.currentElement.appendChild(textNode);
      if (!shouldIgnoreOverflowOfCurrentRegion() && canSplitCurrent()) {
        currentRegion.suppressErrors = true;
        continueInNextRegion();
      }
    }
  }

  const shouldTraverseChildren = (element: HTMLElement): boolean => {
    if (hasOverflowed()) {
      // This element doesn't seem to fit when all its children are included
      return true;
    }
    if (element.querySelector('img')) {
      // An image may not have loaded yet, which would
      // make the check for overflow incorrect
      return true;
    }
    if (shouldTraverse(element)) {
      // The caller knows a different reason
      return true;
    }
    return false;
  };

  const addElement = async (element: HTMLElement): Promise<void> => {
    // Ensure images are loaded before testing for overflow
    if (isUnloadedImage(element)) {
      const waitTime = await ensureImageLoaded(element);
      recordTimestamp(waitTime);
    }

    // Transforms before adding
    prepareToAdd(element, continueInNextRegion);

    // Append element and push onto the the stack
    currentRegion.currentElement.appendChild(element);
    currentRegion.path.push(element);

    if (shouldTraverseChildren(element)) {
      await clearAndAddChildren(element);
    }

    // We're done: Pop off the stack and do any cleanup
    const addedElement = currentRegion.path.pop()!;  
    finishAdding(addedElement, continueInNextRegion);
  };

  const clearAndAddChildren = async (element: HTMLElement) => {
    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    if (hasOverflowed() && !shouldIgnoreOverflowOfCurrentRegion() && canSplitCurrent()) {
      // Overflows when empty
      tryInNextRegion(currentRegion, continueInNextRegion, canSplit);
    }

    const shouldSplit = canSplit(element) && !shouldIgnoreOverflow(element);

    for (const child of childNodes) {
      if (isTextNode(child)) {
        await addText(child, shouldSplit);
      } else if (isContentElement(child)) {
        await addElement(child);
      } else {
        // Skip comments and unknown nodes
      }
    }
  }

  return addElement(content);
};

export default flowIntoRegions;
