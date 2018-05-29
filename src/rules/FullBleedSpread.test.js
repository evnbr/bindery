import FullBleedSpread from './FullBleedSpread';

const createEl = (tag, txt) => {
  const el = document.createElement(tag);
  if (txt) el.textContent = txt;
  return el;
};

const pageStub = n => ({
  element: createEl('div'),
  flow: { element: createEl('div') },
  background: createEl('div'),
  number: n,
  isEmpty: false,
  setPreference: () => {},
});

const nextPage = () => pageStub();

const spread = new FullBleedSpread({ selector: 'figure' });

test('Spread gets created', () => {
  const book = { pages: [pageStub(0), pageStub(1)] };
  book.currentPage = book.pages[1];

  const el = createEl('figure');
  book.currentPage.flow.element.appendChild(el);

  spread.createOutOfFlowPages(el, book, pageStub);

  expect(book.currentPage.flow.element.contains(el)).toBe(false);
  expect(book.pages[2].background.contains(el)).toBe(true);
  expect(book.pages.length).toBe(4);
});

test('Blank page gets reused', () => {
  const book = { pages: [pageStub(0), pageStub(1)] };
  book.currentPage = book.pages[1];
  book.currentPage.isEmpty = true;

  const el = createEl('figure');
  book.currentPage.flow.element.appendChild(el);

  spread.createOutOfFlowPages(el, book, pageStub);

  expect(book.currentPage.flow.element.contains(el)).toBe(false);
  expect(book.currentPage.background.contains(el)).toBe(true);
  expect(book.pages.length).toBe(3);
});

test('Pages get placed in rotate container', () => {
  const rotatedSpread = new FullBleedSpread({ rotate: 'clockwise', selector: 'figure' });

  const book = { pages: [pageStub(0), pageStub(1)] };
  book.currentPage = book.pages[1];

  const el = createEl('figure');
  book.currentPage.flow.element.appendChild(el);

  rotatedSpread.createOutOfFlowPages(el, book, pageStub);

  expect(book.pages.length).toBe(4);
  expect(book.pages[2].flow.element.contains(el)).toBe(false);
  expect(book.pages[2].background.contains(el)).toBe(true);
  expect(book.pages[2].background.parentNode.parentNode).toBe(book.pages[2].element);
});
