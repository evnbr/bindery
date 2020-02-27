import Page from './Page';

let page;
beforeEach(() => {
  page = new Page();
});

test('Page leftright', () => {
  page.setLeftRight('left');
  expect(page.isLeft).toBe(true);
  expect(page.isRight).toBe(false);
  expect(page.element.className.includes('left')).toBe(true);
  expect(page.element.className.includes('right')).toBe(false);

  page.setLeftRight('right');
  expect(page.isLeft).toBe(false);
  expect(page.isRight).toBe(true);
  expect(page.element.className.includes('left')).toBe(false);
  expect(page.element.className.includes('right')).toBe(true);
});

test('Page setPreference', () => {
  page.setPreference('left');
  expect(page.alwaysLeft).toBe(true);
  expect(page.alwaysRight).toBe(false);

  page.setPreference('right');
  expect(page.alwaysLeft).toBe(false);
  expect(page.alwaysRight).toBe(true);
});

describe('Page isEmpty', () => {
  test('no content', () => {
    expect(page.isEmpty).toBe(true);
  });
  test('text is not empty', () => {
    const text = document.createTextNode('sample');
    page.flow.content.appendChild(text);
    expect(page.isEmpty).toBe(false);
  });
  test('out-of-flow is not empty', () => {
    page.hasOutOfFlowContent = true;
    expect(page.isEmpty).toBe(false);
  });
});

test('Throws on overflow', () => {
  let hasOver = false;
  page.hasOverflowed = () => hasOver;
  expect(page.hasOverflowed()).toBe(false);

  hasOver = true;
  expect(page.hasOverflowed()).toBe(true);

  expect(() => {
    page.validate();
    page.validateEnd();
  }).toThrow();

  page.suppressErrors = true;
  expect(() => {
    page.validateEnd();
  }).not.toThrow();
});
