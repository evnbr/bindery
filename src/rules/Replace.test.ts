import Replace from './Replace';

const createEl = (tag, txt?) => {
  const el = document.createElement(tag);
  if (txt) el.textContent = txt;
  return el;
};

const replacer = new Replace({
  selector: 'p',
  replace: el => {
    el.textContent = 'I was replaced';
    return el;
  },
});

const next = jest.fn();
const newPage = jest.fn();
const overflow = jest.fn();

test('Replaces test element', () => {
  const book = { currentPage: { hasOverflowed: () => false } };
  const page = createEl('div');
  const original = createEl('p', 'I am original');
  page.appendChild(original);

  const replaced = replacer.afterAdd(original, book, next, newPage, overflow);

  expect(page.contains(replaced)).toBe(true);
  expect(page.contains(original)).toBe(false);

  expect(overflow).not.toBeCalled();
  expect(newPage).not.toBeCalled();
  expect(next).not.toBeCalled();
});

test("Doesn't replace element if it overflows", () => {
  const book = { currentPage: { hasOverflowed: () => true } };
  const page = createEl('div');
  const original = createEl('p', 'I am original');
  page.appendChild(original);

  const replaced = replacer.afterAdd(original, book, next, newPage, overflow);

  expect(page.contains(replaced)).toBe(false);
  expect(page.contains(original)).toBe(true);

  expect(overflow).toBeCalled();
  expect(newPage).not.toBeCalled();
  expect(next).not.toBeCalled();
});

test("Throws if element hasn't been added to a parent", () => {
  const original = createEl('p', 'I am original');
  expect(() => {
    replacer.afterAdd(original, {}, next, newPage, overflow);
  }).toThrow();
});
