import shouldIgnoreOverflow from '../shouldIgnoreOverflow';

test('Allow overflow', () => {
  const div = document.createElement('div');
  const span = document.createElement('span');
  div.appendChild(span);

  expect(shouldIgnoreOverflow(span)).toBe(false);
});

test('Ignore overflow for marked elements', () => {
  const div = document.createElement('div');
  const span = document.createElement('span');
  div.appendChild(span);

  span.setAttribute('data-ignore-overflow', true);

  expect(shouldIgnoreOverflow(span)).toBe(true);
});

test('Ignore overflow for child of marked element', () => {
  const div = document.createElement('div');
  const span = document.createElement('span');
  div.appendChild(span);

  div.setAttribute('data-ignore-overflow', true);

  expect(shouldIgnoreOverflow(span)).toBe(true);
});
