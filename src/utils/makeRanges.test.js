import makeRanges from './makeRanges';

test('Doesn\'t create ranges for spaced pages', () => {
  expect(makeRanges([1, 3, 5, 7])).toEqual('1, 3, 5, 7');
});

test('Creates ranges for adjacent pages', () => {
  expect(makeRanges([1, 2, 3, 4])).toEqual('1–4');
});

test('Creates multiple ranges', () => {
  expect(makeRanges([1, 2, 5, 6, 7])).toEqual('1–2, 5–7');
});

test('Can end with a range', () => {
  expect(makeRanges([1, 3, 4, 5, 8, 10, 11])).toEqual('1, 3–5, 8, 10–11');
});

test('Can end with a lone page', () => {
  expect(makeRanges([1, 3, 4, 5, 8, 9, 12])).toEqual('1, 3–5, 8–9, 12');
});
