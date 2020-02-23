import { flipLayout, gridLayout, printLayout } from './index';
import { Layout } from '../constants';

const pages = [
  { element: document.createElement('div') },
  { element: document.createElement('div') },
  { element: document.createElement('div') },
  { element: document.createElement('div') },
];

test('creates two-up grid layout', () => {
  const grid = gridLayout(pages, true);
  expect(grid instanceof DocumentFragment).toBe(true);
});

test('creates one-up grid layout', () => {
  const grid = gridLayout(pages, false);
  expect(grid instanceof DocumentFragment).toBe(true);
});

test('creates flip layout', () => {
  const flip = flipLayout(pages, true);
  expect(flip instanceof DocumentFragment).toBe(true);
});

test('creates print single layout', () => {
  const print = printLayout(pages, Layout.PAGES);
  expect(print instanceof DocumentFragment).toBe(true);
});

test('creates print spread layout', () => {
  const print = printLayout(pages, Layout.SPREADS);
  expect(print instanceof DocumentFragment).toBe(true);
});

test('creates print booklet layout', () => {
  const print = printLayout(pages, Layout.BOOKLET);
  expect(print instanceof DocumentFragment).toBe(true);
});
