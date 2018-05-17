import { isTextNode, isUnloadedImage, isContent } from '../nodeTypes';

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

test('isContent recognizes div', () => {
  expect(isContent(div)).toBe(true);
});

test('isContent rejects textNode', () => {
  expect(isContent(textNode)).toBe(false);
});

test('isContent rejects script', () => {
  expect(isContent(script)).toBe(false);
});
