import FullBleedPage from './FullBleedPage';

const createEl = (tag, txt) => {
  const el = document.createElement(tag);
  if (txt) el.textContent = txt;
  return el;
};

const pageStub = n => ({
  element: createEl('div'),
  background: createEl('div'),
  number: n,
  isEmpty: false,
  setPreference: () => {},
});


const spread = new FullBleedPage({ selector: 'figure' });

test('Spread gets created', () => {
  const book = { pages: [pageStub(0), pageStub(1)] };
  book.currentPage = book.pages[1];

  const el = createEl('figure');
  book.currentPage.element.appendChild(el);

  spread.createOutOfFlowPages(el, book, pageStub);

  expect(book.currentPage.element.contains(el)).toBe(false);
  expect(book.pages[2].background.contains(el)).toBe(true);
  expect(book.pages.length).toBe(3);
});

test('Blank page gets reused', () => {
  const book = { pages: [pageStub(0), pageStub(1)] };
  book.currentPage = book.pages[1];
  book.currentPage.isEmpty = true;

  const el = createEl('figure');
  book.currentPage.element.appendChild(el);

  spread.createOutOfFlowPages(el, book, pageStub);

  expect(book.currentPage.element.contains(el)).toBe(false);
  expect(book.currentPage.background.contains(el)).toBe(true);
  expect(book.pages.length).toBe(2);
});
