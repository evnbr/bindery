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
