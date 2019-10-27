import { pageNumbersForTest, pageNumbersForSelector, formatAsRanges } from './searchPages';

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


test('Doesn\'t create ranges for spaced pages', () => {
  expect(formatAsRanges([1, 3, 5, 7])).toEqual('1, 3, 5, 7');
});

describe('Make Ranges', () => {
  test('Creates ranges for adjacent pages', () => {
    expect(formatAsRanges([1, 2, 3, 4])).toEqual('1–4');
  });

  test('Creates multiple ranges', () => {
    expect(formatAsRanges([1, 2, 5, 6, 7])).toEqual('1–2, 5–7');
  });

  test('Can end with a range', () => {
    expect(formatAsRanges([1, 3, 4, 5, 8, 10, 11])).toEqual('1, 3–5, 8, 10–11');
  });

  test('Can end with a lone page', () => {
    expect(formatAsRanges([1, 3, 4, 5, 8, 9, 12])).toEqual('1, 3–5, 8–9, 12');
  });
});
