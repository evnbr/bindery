import Viewer from '../index';
import { Mode, Layout, Marks } from '../../Constants';

global.requestAnimationFrame = func => func();

const viewer = new Viewer({
  bindery: { pageSetup: {} },
  mode: Mode.PREVIEW,
  layout: Layout.PAGES,
  marks: Marks.BOTH,
});

const book = {
  pages: [
    { element: document.createElement('div') },
    { element: document.createElement('div') },
    { element: document.createElement('div') },
    { element: document.createElement('div') },
  ],
};

test('creates viewer', () => {
  expect(viewer.element.nodeType).toBe(Node.ELEMENT_NODE);
});

test('crop marks show/hide', () => {
  viewer.isShowingCropMarks = false;
  expect(viewer.isShowingCropMarks).toBe(false);
  viewer.isShowingCropMarks = true;
  expect(viewer.isShowingCropMarks).toBe(true);
});

test('renderProgress() adds all pages', () => {
  viewer.clear();
  viewer.renderProgress(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('viewer.clear() removes all pages', () => {
  viewer.clear();
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([false, false, false, false]);
});

test('GRID mode adds all pages', () => {
  viewer.clear();
  viewer.mode = Mode.GRID;
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('FLIPBOOK mode adds all pages', () => {
  viewer.clear();
  viewer.mode = Mode.FLIPBOOK;
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('PRINT mode adds all pages', () => {
  viewer.clear();
  viewer.mode = Mode.PRINT;
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});
