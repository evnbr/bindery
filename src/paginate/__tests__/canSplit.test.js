import { c } from '../../dom';
import { ignoreOverflow, canSplit } from '../canSplit';

let div;
let span;
beforeEach(() => {
  div = document.createElement('div');
  span = document.createElement('span');
  div.appendChild(span);
});

describe('ignoreOverflow', () => {
  test('Recognizes overflow by default', () => {
    expect(ignoreOverflow(span)).toBe(false);
  });

  test('Ignores overflow for marked elements', () => {
    span.setAttribute('data-ignore-overflow', true);
    expect(ignoreOverflow(span)).toBe(true);
  });

  test('Ignores overflow for child of marked element', () => {
    div.setAttribute('data-ignore-overflow', true);
    expect(ignoreOverflow(span)).toBe(true);
  });
});

describe('isSplittable', () => {
  const noSplitClass = 'do-not-split-me';
  const selectors = [`.${noSplitClass}`];

  test('Allows by default', () => {
    expect(canSplit(span, selectors)).toBe(true);
  });

  test('Denies when matches selector', () => {
    span.classList.add(noSplitClass);
    expect(canSplit(span, selectors)).toBe(false);
  });

  test('Allows for matching elements that have already split', () => {
    span.classList.add(noSplitClass, c('continuation'));
    expect(canSplit(span, selectors)).toBe(true);
  });

  test('Allows for matching elements that have been moved', () => {
    span.setAttribute('data-bindery-did-move', true);
    expect(canSplit(span, selectors)).toBe(true);
  });

  test('Denies when parent matches selector', () => {
    div.classList.add(noSplitClass);
    expect(canSplit(span, selectors)).toBe(false);
  });
});
