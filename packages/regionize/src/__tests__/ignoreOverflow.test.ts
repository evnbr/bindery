import ignoreOverflow from '../ignoreOverflow';

let div: HTMLElement;
let span: HTMLElement;
beforeEach(() => {
  div = document.createElement('div');
  span = document.createElement('span');
  div.appendChild(span);
});

describe('ignoreOverflow', () => {
  test('Recognizes overflow by default', () => {
    expect(ignoreOverflow(span)).toBe(false);
  });

  test('Ignores overflow for marked elements', () => {
    span.setAttribute('data-ignore-overflow', 'true');
    expect(ignoreOverflow(span)).toBe(true);
  });

  test('Ignores overflow for child of marked element', () => {
    div.setAttribute('data-ignore-overflow', 'true');
    expect(ignoreOverflow(span)).toBe(true);
  });
});
