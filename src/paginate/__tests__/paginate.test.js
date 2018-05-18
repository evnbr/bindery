import paginate from '../paginate';

let time = 0;
global.performance = { now: () => {
  time += 1;
  return time;
} };

const content = document.createElement('div');
const span = document.createElement('span');
content.textContent = 'Div Content';
span.textContent = 'Span Content';
content.appendChild(span);

const progress = () => {};

const mockEl = () => document.createElement('div');
jest.mock('../../Page', () => () => {
  const flowContent = mockEl();
  const hasOverflowed = () => flowContent.textContent.length > 10;
  return {
    element: mockEl(),
    flowContent,
    currentElement: flowContent,
    hasOverflowed,
    validate: () => true,
    validateEnd: () => true,
    setLeftRight: () => {},
  };
});

test('Creates a book at all', () => {
  paginate(content, [], progress)
    .then((book) => {
      expect(book.isComplete).toBe(true);
      const allText = book.pages
        .map(pg => pg.flowContent.textContent)
        .join('')
        .replace(/\s+/g, '');
      expect(allText).toBe('DivContentSpanContent');
    })
    .catch(e => console.error(e));
});
