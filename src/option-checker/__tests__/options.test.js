import { validate, T } from '../index';

test('Handles functions', () => {
  expect(T.func(() => {})).toBe(true);
  expect(T.func('string')).toBe(false);
});

test('Handles objects', () => {
  expect(T.obj({ key: 'val' })).toBe(true);
  expect(T.obj('string')).toBe(false);
});

test('Handles arrays', () => {
  expect(T.array(['a', 'b', 'c'])).toBe(true);
  expect(T.array('string')).toBe(false);
});

test('Handles bools', () => {
  expect(T.bool(false)).toBe(true);
  expect(T.bool('false')).toBe(false);
});

test('Handles strings', () => {
  expect(T.string('str')).toBe(true);
  expect(T.string(true)).toBe(false);
});

test('Handles CSS lengths', () => {
  expect(T.length('12px')).toBe(true);
  expect(T.length('12px')).toBe(true);
  expect(T.length(12)).toBe(false);
});

test('Rejects Relative CSS lengths', () => {
  expect(T.length('12%')).toBe(false);
  expect(T.length('12vw')).toBe(false);
});

test('Handles enums', () => {
  const enumChecker = T.enum('left', 'right');
  expect(enumChecker('left')).toBe(true);
  expect(enumChecker('right')).toBe(true);
  expect(enumChecker('up')).toBe(false);
  expect(enumChecker('down')).toBe(false);
});

test('Handles shapes', () => {
  const shapeChecker = T.shape({
    height: T.length,
    name: T.string,
  });
  expect(shapeChecker({
    height: '12px',
    name: 'example',
  })).toBe(true);

  expect(shapeChecker({
    width: '12px',
    title: 'example',
  })).toBe(false);
});

describe('Margins', () => {
  test('Handles margins', () => {
    expect(T.margin({
      top: '12px',
      inner: '12px',
      outer: '12px',
      bottom: '12px',
    })).toBe(true);
  });
  test('Reject non-length side', () => {
    expect(T.margin({
      top: '12px',
      inner: 12,
      outer: '12px',
      bottom: '12px',
    })).toBe(false);
  });

  // test('Reject margins with missing sides', () => {
  //   expect(T.margin({
  //     top: '12px',
  //     bottom: '12px',
  //   })).toBe(false);
  // });
  test('Reject margins with extra side', () => {
    expect(T.margin({
      top: '12px',
      huh: '12px',
      inner: '12px',
      outer: '12px',
      bottom: '12px',
    })).toBe(false);
  });
});

describe('Sizes', () => {
  test('Handles sizes', () => {
    expect(T.size({
      width: '12px',
      height: '12px',
    })).toBe(true);
  });
  test('Reject non-length side', () => {
    expect(T.size({
      width: '12px',
      height: 12,
    })).toBe(false);
  });
  test('Reject extra side', () => {
    expect(T.size({
      width: '12px',
      height: '12px',
      hm: '12px',
    })).toBe(false);
  });
});
