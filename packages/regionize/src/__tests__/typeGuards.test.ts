import { isTextNode, isUnloadedImage, isContentElement } from '../typeGuards';

const textNode = document.createTextNode('sample');
const div = document.createElement('div');
const img = document.createElement('img');
const script = document.createElement('script');

test('isTextNode recognizes textNode', () => {
  expect(isTextNode(textNode)).toBe(true);
});

test('isTextNode rejects div', () => {
  expect(isTextNode(div)).toBe(false);
});

test('isUnloadedImage recognizes image', () => {
  expect(isUnloadedImage(img)).toBe(true);
});

test('isContentElement recognizes div', () => {
  expect(isContentElement(div)).toBe(true);
});

test('isContentElement rejects textNode', () => {
  expect(isContentElement(textNode)).toBe(false);
});

test('isContentElement rejects script', () => {
  expect(isContentElement(script)).toBe(false);
});
