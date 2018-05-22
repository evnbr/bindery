import Viewer from '../Viewer';
import { Mode, Layout, Marks } from '../../main/Constants';

global.requestAnimationFrame = func => func();

const Controls = function () {
  return {
    element: document.createElement('div'),
    setDone: () => {},
    updateProgress: () => {},
  };
};

const pageSetup = {
  setPrintTwoUp: () => null,
  updateStyleVars: () => null,
};

const viewer = new Viewer({
  pageSetup,
  mode: Mode.PREVIEW,
  layout: Layout.PAGES,
  marks: Marks.BOTH,
  ControlsComponent: Controls,
});

const mockPage = () => {
  const pg = { element: document.createElement('div') };
  return pg;
};
const currentPage = mockPage();
const book = {
  pages: [mockPage(), mockPage(), mockPage(), currentPage],
  currentPage,
};

test('creates viewer', () => {
  expect(viewer.element.nodeType).toBe(Node.ELEMENT_NODE);
});

test('crop mark getter/setters work', () => {
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

test('PREVIEW mode adds all pages', () => {
  viewer.clear();
  viewer.mode = Mode.PREVIEW;
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

test('PRINT mode, PAGE layout adds all pages', () => {
  viewer.clear();
  viewer.mode = Mode.PRINT;
  viewer.setPrintArrange(Layout.PAGES);
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('PRINT mode, SPREAD layout adds all pages', () => {
  viewer.clear();
  viewer.mode = Mode.PRINT;
  viewer.setPrintArrange(Layout.SPREADS);
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('PRINT mode, BOOKLET layout adds all pages', () => {
  viewer.clear();
  viewer.mode = Mode.PRINT;
  viewer.setPrintArrange(Layout.BOOKLET);
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});
