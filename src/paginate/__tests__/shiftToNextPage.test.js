import Page from '../../Page';
import shiftToNextPage from '../shiftToNextPage';

const el = () => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode('text content'));
  return div;
};

const mockPage = (path) => {
  const page = new Page();
  if (path) {
    page.flowContent.appendChild(path[0]);
    for (let i = 0; i < path.length - 1; i += 1) {
      path[i].appendChild(path[i + 1]);
    }
    page.path = path;
  } else {
    page.path = [];
  }
  page.hasOverflowed = () => false;
  return page;
};

let a;
let b;
let c;
let d;
beforeEach(() => {
  a = el();
  b = el();
  c = el();
  d = el();
});

test('Shifts one element when none of its parents complain', () => {
  const page = mockPage([a, b, c, d]);
  const nextPage = mockPage();
  const next = () => nextPage;
  const canSplit = () => true;

  shiftToNextPage(page, next, canSplit);
  expect(page.path).toEqual([a, b, c]);
  expect(nextPage.path).toEqual([d]);
});

test('Shifts two elements when parent would be empty', () => {
  c.textContent = '';
  const page = mockPage([a, b, c, d]);
  const nextPage = mockPage();
  const next = () => nextPage;
  const canSplit = () => true;

  shiftToNextPage(page, next, canSplit);
  expect(page.path).toEqual([a, b]);
  expect(nextPage.path).toEqual([c, d]);
});

test('Shifts two elements when parent can\t split', () => {
  const page = mockPage([a, b, c, d]);
  const nextPage = mockPage();
  const next = () => nextPage;
  const canSplit = elmt => elmt !== c;

  shiftToNextPage(page, next, canSplit);
  expect(page.path).toEqual([a, b]);
  expect(nextPage.path).toEqual([c, d]);
});

test('Shifts three elements when grandparent can\t split', () => {
  const page = mockPage([a, b, c, d]);
  const nextPage = mockPage();
  const next = () => nextPage;
  const canSplit = elmt => elmt !== c && elmt !== b;

  shiftToNextPage(page, next, canSplit);
  expect(page.path).toEqual([a]);
  expect(nextPage.path).toEqual([b, c, d]);
});

test('Does not shift elements if whole page would be empty', () => {
  a.textContent = '';
  const page = mockPage([a, b, c, d]);
  const nextPage = mockPage();
  const next = () => false;
  const canSplit = () => false;

  shiftToNextPage(page, next, canSplit);
  expect(page.path).toEqual([a, b, c, d]);
  expect(nextPage.path).toEqual([]);
});
