import { pageNumbersForTest } from '../searchPages';

const pageStub = (num, str) => {
  const el = document.createElement('div');
  el.textContent = str;
  return { number: num, element: el };
};

const pages = [
  pageStub(0, 'okay'),
  pageStub(1, 'here'),
  pageStub(2, 'here'),
  pageStub(3, 'okay'),
];

test('Finds text', () => {
  const test = el => el.textContent.includes('here');
  expect(pageNumbersForTest(pages, test)).toEqual([1, 2]);
});
