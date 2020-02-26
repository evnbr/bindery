import { renderGridViewer } from './gridViewer';
import { renderSheetViewer } from './sheetViewer';
import { renderFlipbookViewer } from './flipbookViewer';
import { SheetLayout } from '../constants';

const pages = [
  { element: document.createElement('div') },
  { element: document.createElement('div') },
  { element: document.createElement('div') },
  { element: document.createElement('div') },
];

test('creates two-up grid layout', () => {
  const grid = renderGridViewer(pages, true);
  expect(grid instanceof DocumentFragment).toBe(true);
});

test('creates one-up grid layout', () => {
  const grid = renderGridViewer(pages, false);
  expect(grid instanceof DocumentFragment).toBe(true);
});

test('creates flip layout', () => {
  const flip = renderFlipbookViewer(pages, true);
  expect(flip instanceof DocumentFragment).toBe(true);
});

test('creates print single layout', () => {
  const print = renderSheetViewer(pages, false, SheetLayout.PAGES);
  expect(print instanceof DocumentFragment).toBe(true);
});

test('creates print spread layout', () => {
  const print = renderSheetViewer(pages, false, SheetLayout.SPREADS);
  expect(print instanceof DocumentFragment).toBe(true);
});

test('creates print booklet layout', () => {
  const print = renderSheetViewer(pages, false, SheetLayout.BOOKLET);
  expect(print instanceof DocumentFragment).toBe(true);
});
