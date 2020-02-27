import Footnote from './Footnote';

const createEl = (tag, txt) => {
  const el = document.createElement(tag);
  if (txt) el.textContent = txt;
  return el;
};

const pageStub = () => ({
  element: createEl('div'),
  flow: { element: createEl('div') },
  background: createEl('div'),
  footer: createEl('div'),
  isEmpty: false,
  hasOverflowed: () => false
});

test('Adds footnotes', () => {
  const footnote = new Footnote({ selector: 'a' });
  const bookStub = { currentPage: pageStub() };
  const el = createEl('div', 'Click here');
  bookStub.currentPage.flow.element.appendChild(el);

  const replacedEl = footnote.afterAdd(el, bookStub, null, null, null);

  expect(bookStub.currentPage.flow.element.contains(el)).toBe(false);
  expect(bookStub.currentPage.flow.element.contains(replacedEl)).toBe(true);
  expect(bookStub.currentPage.footer.children.length).toBe(1);

  const el2 = createEl('div', 'Now click here');
  bookStub.currentPage.flow.element.appendChild(el2);
  const replaced2 = footnote.afterAdd(el2, bookStub, null, null, null);

  expect(bookStub.currentPage.flow.element.contains(el2)).toBe(false);
  expect(bookStub.currentPage.flow.element.contains(replaced2)).toBe(true);
  expect(bookStub.currentPage.footer.children.length).toBe(2);
});

test('Custom footnotes are rendered', () => {
  const footnote = new Footnote({
    selector: 'a',
    render: (el, num) => createEl('div', `${num}: ${el.getAttribute('href')}`)
  });
  const bookStub = { currentPage: pageStub() };
  const el = createEl('a', 'Click here');
  el.href = '#url';
  bookStub.currentPage.flow.element.appendChild(el);

  const replacedEl = footnote.afterAdd(el, bookStub, null, null, null);

  expect(bookStub.currentPage.flow.element.contains(el)).toBe(false);
  expect(bookStub.currentPage.flow.element.contains(replacedEl)).toBe(true);
  expect(bookStub.currentPage.footer.children.length).toBe(1);
  expect(bookStub.currentPage.footer.children[0].textContent).toBe('1: #url');

  const el2 = createEl('a', 'Now click here');
  el2.href = '#url2';
  bookStub.currentPage.flow.element.appendChild(el2);
  const replaced2 = footnote.afterAdd(el2, bookStub, null, null, null);

  expect(bookStub.currentPage.flow.element.contains(el2)).toBe(false);
  expect(bookStub.currentPage.flow.element.contains(replaced2)).toBe(true);
  expect(bookStub.currentPage.footer.children.length).toBe(2);
  expect(bookStub.currentPage.footer.children[1].textContent).toBe('2: #url2');
});
