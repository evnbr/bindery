import validate from './validateRuntimeOptions';
import T from './RuntimeTypes';

const kIsFunc = { k: T.func };
test('Handles functions', () => {
  expect(validate({ k: () => {} }, kIsFunc)).toBe(true);
  expect(() => {
    validate({ k: 'func' }, kIsFunc);
  }).toThrow();
});

const kIsObj = { k: T.obj };
test('Handles objects', () => {
  expect(validate({ k: { key: 'val' } }, kIsObj)).toBe(true);

  expect(() => {
    validate({ k: 'obj' }, kIsObj);
  }).toThrow();
});

const kIsArr = { k: T.array };
test('Handles arrays', () => {
  expect(validate({ k: ['a', 'b', 'c'] }, kIsArr)).toBe(true);

  expect(() => {
    validate({ k: 'abc' }, kIsArr);
  }).toThrow();
});

const kIsBool = { k: T.bool };
test('Handles bools', () => {
  expect(validate({ k: false }, kIsBool)).toBe(true);

  expect(() => {
    validate({ k: 'false' }, kIsBool);
  }).toThrow();
});

const kIsString = { k: T.string };
test('Handles strings', () => {
  expect(validate({ k: 'str' }, kIsString)).toBe(true);

  expect(() => {
    validate({ k: true }, kIsString);
  }).toThrow();
});

const kIsLength = { k: T.length };
test('Handles CSS lengths', () => {
  expect(validate({ k: '12px' }, kIsLength)).toBe(true);
  expect(validate({ k: '12in' }, kIsLength)).toBe(true);
  expect(() => {
    validate({ k: 12 }, kIsLength);
  }).toThrow();
});

test('Rejects Relative CSS lengths', () => {
  expect(() => {
    validate({ k: '12%' }, kIsLength);
  }).toThrow();
  expect(() => {
    validate({ k: '12vw' }, kIsLength);
  }).toThrow();
});

const kIsDirection = { k: T.enum('left', 'right') };
test('Handles enums', () => {
  expect(validate({ k: 'left' }, kIsDirection)).toBe(true);
  expect(validate({ k: 'right' }, kIsDirection)).toBe(true);
  expect(() => {
    validate({ k: 'up' }, kIsDirection);
  }).toThrow();
  expect(() => {
    validate({ k: 'down' }, kIsDirection);
  }).toThrow();
});

const kIsShape = {
  k: T.shape({ height: T.length, name: T.string })
};

test('Handles shapes', () => {
  expect(
    validate(
      {
        k: { height: '12px', name: 'example' }
      },
      kIsShape
    )
  ).toBe(true);

  expect(() => {
    validate(
      {
        k: { height: '12px', title: 'example' }
      },
      kIsShape
    );
  }).toThrow();
});

const kIsMargin = { k: T.margin };
describe('Margins', () => {
  test('Handles margins', () => {
    expect(
      validate(
        {
          k: {
            top: '12px',
            inner: '12px',
            outer: '12px',
            bottom: '12px'
          }
        },
        kIsMargin
      )
    ).toBe(true);
  });

  test('Rejects non-objects', () => {
    expect(() => {
      validate(
        {
          k: 'margins?'
        },
        kIsMargin
      );
    }).toThrow();
  });

  test('Reject non-length side', () => {
    expect(() => {
      validate(
        {
          k: {
            top: '12px',
            inner: 12,
            outer: '12px',
            bottom: '12px'
          }
        },
        kIsMargin
      );
    }).toThrow();
  });

  test('Reject margins with missing sides', () => {
    expect(() => {
      validate(
        {
          k: {
            top: '12px',
            bottom: '12px'
          }
        },
        kIsMargin
      );
    }).toThrow();
  });

  test('Reject margins with extra side', () => {
    expect(() => {
      validate(
        {
          k: {
            top: '12px',
            clockwise: '12px',
            inner: '12px',
            outer: '12px',
            bottom: '12px'
          }
        },
        kIsMargin
      );
    }).toThrow();
  });
});

const kIsSize = { k: T.size };
describe('Sizes', () => {
  test('Handles sizes', () => {
    expect(
      validate(
        {
          k: {
            width: '12px',
            height: '12px'
          }
        },
        kIsSize
      )
    ).toBe(true);
  });

  test('Reject non-length side', () => {
    expect(() => {
      validate(
        {
          k: {
            width: '12px',
            height: 12
          }
        },
        kIsSize
      );
    }).toThrow();
  });

  test('Reject extra side', () => {
    expect(() => {
      validate(
        {
          k: {
            width: '12px',
            height: '12px',
            depth: '12px'
          }
        },
        kIsSize
      );
    }).toThrow();
  });
});
