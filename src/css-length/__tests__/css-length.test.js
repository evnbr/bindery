import { parseLength, isLength } from '../index';

test('Recognizes CSS lengths', () => {
  expect(isLength('12px')).toBe(true);
  expect(isLength('12in')).toBe(true);
  expect(isLength('12pt')).toBe(true);
});

test('Negative is ok', () => {
  expect(isLength('-12px')).toBe(true);
});

test('Rejects non-strings', () => {
  expect(isLength(12)).toBe(false);
  expect(isLength({ k: 'obj' })).toBe(false);
  expect(isLength(true)).toBe(false);
});

test('Rejects relative CSS lengths', () => {
  expect(isLength('12%')).toBe(false);
  expect(isLength('12vw')).toBe(false);
});

test('Parses CSS pixel lengths', () => {
  const parsed = parseLength('12px');
  expect(parsed.val).toBe(12);
  expect(parsed.unit).toBe('px');
});

test('Parses CSS decimal inch lengths', () => {
  const parsed = parseLength('0.5in');
  expect(parsed.val).toBe(0.5);
  expect(parsed.unit).toBe('in');
});

test('Throws when trying to parse a non-length', () => {
  expect(() => {
    parseLength('12%');
  }).toThrow();

  expect(() => {
    parseLength(12);
  }).toThrow();

  expect(() => {
    parseLength(true);
  }).toThrow();
});
