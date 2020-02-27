import formatAsRanges from './formatAsRanges';

test("Doesn't create ranges for spaced pages", () => {
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
