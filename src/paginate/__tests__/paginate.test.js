import paginate from '../paginate';

let time = 0;
global.performance = { now: () => {
  time += 1;
  return time;
} };

const mockDoc = document;
const mockEl = () => mockDoc.createElement('div');

jest.mock('../../flow-box', () => function MockFlow() {
  const content = mockEl();
  const hasOverflowed = () => content.textContent.length > 10;
  const path = [];
  const getCurrent = () => (path.length < 1 ? content : path[path.length - 1]);
  return {
    path,
    element: mockEl(),
    content,
    get currentElement() {
      return getCurrent();
    },
    continueFrom: () => {},
    hasOverflowed,
    isReasonableSize: true,
  };
});


test('Creates book, preserves content order', () => {
  const a = mockEl();
  const b = mockEl();
  const c = mockEl();
  a.textContent = 'A content.';
  b.textContent = 'B content.';
  c.textContent = 'C content.';
  a.appendChild(b);
  b.appendChild(c);

  paginate(a, [], () => {})
    .then((book) => {
      expect(book.pageCount).toBe(4);

      const allText = book.pages
        .map(pg => pg.flow.content.textContent)
        .join('').replace(/\s+/g, ''); // whitespace not guaranteed to persist

      expect(allText).toBe('Acontent.Bcontent.Ccontent.');
    })
    .catch(e => console.error(e));
});

test('Splits a single div over many pages', () => {
  const content = mockEl();
  content.textContent = 'A content. B content. C content.';

  paginate(content, [], () => {})
    .then((book) => {
      expect(book.pageCount).toBe(4);

      const allText = book.pages
        .map(pg => pg.flow.content.textContent)
        .join('').replace(/\s+/g, ''); // whitespace not guaranteed to persist
      expect(allText).toBe('Acontent.Bcontent.Ccontent.');

      expect(book.pages.map(pg => pg.isOverflowing()))
        .toEqual([false, false, false, false]);
    })
    .catch(e => console.error(e));
});
