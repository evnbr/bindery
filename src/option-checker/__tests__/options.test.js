import { validate, T } from '../index';

const kIsFunc = { k: T.func };
test('Handles functions', () => {
  expect(validate({ k: () => {} }, kIsFunc)).toBe(true);
  expect(validate({ k: 'func' }, kIsFunc)).toBe(false);
});

const kIsObj = { k: T.obj };
test('Handles objects', () => {
  expect(validate({ k: { key: 'val' } }, kIsObj)).toBe(true);
  expect(validate({ k: 'obj' }, kIsObj)).toBe(false);
});

const kIsArr = { k: T.array };
test('Handles arrays', () => {
  expect(validate({ k: ['a', 'b', 'c'] }, kIsArr)).toBe(true);
  expect(validate({ k: 'abc' }, kIsArr)).toBe(false);
});

const kIsBool = { k: T.bool };
test('Handles bools', () => {
  expect(validate({ k: false }, kIsBool)).toBe(true);
  expect(validate({ k: 'false' }, kIsBool)).toBe(false);
});

const kIsString = { k: T.string };
test('Handles strings', () => {
  expect(validate({ k: 'str' }, kIsString)).toBe(true);
  expect(validate({ k: true }, kIsString)).toBe(false);
});

const kIsLength = { k: T.length };
test('Handles CSS lengths', () => {
  expect(validate({ k: '12px' }, kIsLength)).toBe(true);
  expect(validate({ k: '12in' }, kIsLength)).toBe(true);
  expect(validate({ k: 12 }, kIsLength)).toBe(false);
});
test('Rejects Relative CSS lengths', () => {
  expect(validate({ k: '12%' }, kIsLength)).toBe(false);
  expect(validate({ k: '12vw' }, kIsLength)).toBe(false);
});

const kIsDirection = { k: T.enum('left', 'right') };
test('Handles enums', () => {
  expect(validate({ k: 'left' }, kIsDirection)).toBe(true);
  expect(validate({ k: 'right' }, kIsDirection)).toBe(true);
  expect(validate({ k: 'up' }, kIsDirection)).toBe(false);
  expect(validate({ k: 'down' }, kIsDirection)).toBe(false);
});

const kIsShape = {
  k: T.shape({ height: T.length, name: T.string }),
};

test('Handles shapes', () => {
  expect(validate({
    k: {
      height: '12px',
      name: 'example',
    },
  }, kIsShape)).toBe(true);

  expect(validate({
    k: {
      height: '12px',
      title: 'example',
    },
  }, kIsShape)).toBe(false);
});

const kIsMargin = { k: T.margin };
describe('Margins', () => {
  test('Handles margins', () => {
    expect(validate({
      k: {
        top: '12px',
        inner: '12px',
        outer: '12px',
        bottom: '12px',
      },
    }, kIsMargin)).toBe(true);
  });

  test('Rejects non-objects', () => {
    expect(validate({
      k: 'margins?',
    }, kIsMargin)).toBe(false);
  });

  test('Reject non-length side', () => {
    expect(validate({
      k: {
        top: '12px',
        inner: 12,
        outer: '12px',
        bottom: '12px',
      },
    }, kIsMargin)).toBe(false);
  });

  test('Reject margins with missing sides', () => {
    expect(validate({
      k: {
        top: '12px',
        bottom: '12px',
      },
    }, kIsMargin)).toBe(false);
  });

  test('Reject margins with extra side', () => {
    expect(validate({
      k: {
        top: '12px',
        clockwise: '12px',
        inner: '12px',
        outer: '12px',
        bottom: '12px',
      },
    }, kIsMargin)).toBe(false);
  });
});

const kIsSize = { k: T.size };
describe('Sizes', () => {
  test('Handles sizes', () => {
    expect(validate({
      k: {
        width: '12px',
        height: '12px',
      },
    }, kIsSize)).toBe(true);
  });
  test('Reject non-length side', () => {
    expect(validate({
      k: {
        width: '12px',
        height: 12,
      },
    }, kIsSize)).toBe(false);
  });
  test('Reject extra side', () => {
    expect(validate({
      k: {
        width: '12px',
        height: '12px',
        depth: '12px',
      },
    }, kIsSize)).toBe(false);
  });
});
