import { pageNumbersForTest, pageNumbersForSelector } from './searchPages';

const pageStub = (num, str, child) => {
  const el = document.createElement('div');
  if (str) el.textContent = str;
  if (child) el.appendChild(child);
  return { number: num, element: el };
};

describe('Finds page numbers', () => {
  test('Finds text', () => {
    const pages = [
      pageStub(0, 'okay'),
      pageStub(1, 'here'),
      pageStub(2, 'here'),
      pageStub(3, 'okay'),
    ];

    const test = el => el.textContent.includes('here');
    expect(pageNumbersForTest(pages, test)).toEqual([1, 2]);
  });

  test('Matches selector', () => {
    const pages = [
      pageStub(0, 'okay', document.createElement('div')),
      pageStub(1, 'here', document.createElement('div')),
      pageStub(2, 'here', document.createElement('p')),
      pageStub(3, 'okay', document.createElement('p')),
    ];

    expect(pageNumbersForSelector(pages, 'p')).toEqual([2, 3]);
  });
});