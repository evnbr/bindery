import Viewer from './Viewer';
import { Mode, Layout, Marks } from '../constants';

global.requestAnimationFrame = func => func();
global.BINDERY_VERSION = 'Test Version';

const ControlsStub = function () {
  return {
    element: document.createElement('div'),
    setDone: () => {},
    updateProgress: () => {},
    setInProgress: () => {},
  };
};

const pageSetup = {
  updateStyleVars: () => null,
};

const viewer = new Viewer({
  pageSetup,
  mode: Mode.PREVIEW,
  layout: Layout.PAGES,
  marks: Marks.BOTH,
  ControlsComponent: ControlsStub,
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

test('updateProgress() adds pages when called multiple times', () => {
  viewer.clear();

  const partialBook = {
    pages: [mockPage(), currentPage],
    currentPage,
  };
  viewer.updateProgress(partialBook, 0.1);
  viewer.renderProgress(partialBook, 0.5);

  const didAdd2 = partialBook.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd2).toEqual([true, true]);
  expect(viewer.isInProgress).toBe(true);

  partialBook.pages.push(mockPage(), mockPage());
  viewer.updateProgress(partialBook, 0.5);
  viewer.renderProgress(partialBook, 0.5);

  const didAdd4 = partialBook.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd4).toEqual([true, true, true, true]);
  expect(viewer.isInProgress).toBe(true);
});

test('viewer.clear() removes all pages', () => {
  viewer.clear();
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([false, false, false, false]);
});

test('PREVIEW mode adds all pages', () => {
  viewer.clear();
  viewer.setMode(Mode.PREVIEW);
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('FLIPBOOK mode adds all pages', () => {
  viewer.clear();
  viewer.setMode(Mode.FLIPBOOK);
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('PRINT mode, PAGE layout adds all pages', () => {
  viewer.clear();
  viewer.setMode(Mode.PRINT);
  viewer.layout = Layout.PAGES;
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('PRINT mode, SPREAD layout adds all pages', () => {
  viewer.clear();
  viewer.setMode(Mode.PRINT);
  viewer.layout = Layout.SPREADS;
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('PRINT mode, BOOKLET layout adds all pages', () => {
  viewer.clear();
  viewer.setMode(Mode.PRINT);
  viewer.layout = Layout.BOOKLET;
  viewer.render(book);
  const didAdd = book.pages.map(pg => viewer.element.contains(pg.element));
  expect(didAdd).toEqual([true, true, true, true]);
});

test('Viewer removed from DOM on hide', () => {
  viewer.hide();
  expect(document.body.contains(viewer.element)).toBe(false);
});

test('Viewer re-added to DOM when displaying error', () => {
  viewer.hide();
  expect(document.body.contains(viewer.element)).toBe(false);
  viewer.displayError('Yikes');
  expect(document.body.contains(viewer.element)).toBe(true);
  expect(viewer.element.contains(viewer.error)).toBe(true);
});
