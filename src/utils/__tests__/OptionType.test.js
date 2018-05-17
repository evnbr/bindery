import OptionType from '../OptionType';

test('Handles functions', () => {
  expect(OptionType.func(() => {})).toBe(true);
  expect(OptionType.func('string')).toBe(false);
});

test('Handles objects', () => {
  expect(OptionType.obj({ key: 'val' })).toBe(true);
  expect(OptionType.obj('string')).toBe(false);
});

test('Handles arrays', () => {
  expect(OptionType.array(['a', 'b', 'c'])).toBe(true);
  expect(OptionType.array('string')).toBe(false);
});

test('Handles bools', () => {
  expect(OptionType.bool(false)).toBe(true);
  expect(OptionType.bool('false')).toBe(false);
});

test('Handles strings', () => {
  expect(OptionType.string('str')).toBe(true);
  expect(OptionType.string(true)).toBe(false);
});

test('Handles CSS lengths', () => {
  expect(OptionType.length('12px')).toBe(true);
  expect(OptionType.length('12px')).toBe(true);
  expect(OptionType.length(12)).toBe(false);
});

test('Rejects Relative CSS lengths', () => {
  expect(OptionType.length('12%')).toBe(false);
  expect(OptionType.length('12vw')).toBe(false);
});

test('Handles enums', () => {
  const enumChecker = OptionType.enum('left', 'right');
  expect(enumChecker('left')).toBe(true);
  expect(enumChecker('right')).toBe(true);
  expect(enumChecker('up')).toBe(false);
  expect(enumChecker('down')).toBe(false);
});

test('Handles shapes', () => {
  const shapeChecker = OptionType.shape({
    height: OptionType.length,
    name: OptionType.string,
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
    expect(OptionType.margin({
      top: '12px',
      inner: '12px',
      outer: '12px',
      bottom: '12px',
    })).toBe(true);
  });
  test('Reject non-length side', () => {
    expect(OptionType.margin({
      top: '12px',
      inner: 12,
      outer: '12px',
      bottom: '12px',
    })).toBe(false);
  });

  // test('Reject margins with missing sides', () => {
  //   expect(OptionType.margin({
  //     top: '12px',
  //     bottom: '12px',
  //   })).toBe(false);
  // });
  test('Reject margins with extra side', () => {
    expect(OptionType.margin({
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
    expect(OptionType.size({
      width: '12px',
      height: '12px',
    })).toBe(true);
  });
  test('Reject non-length side', () => {
    expect(OptionType.size({
      width: '12px',
      height: 12,
    })).toBe(false);
  });
  test('Reject extra side', () => {
    expect(OptionType.size({
      width: '12px',
      height: '12px',
      hm: '12px',
    })).toBe(false);
  });
});
