import paginate from '../paginate';

let time = 0;
global.performance = { now: () => {
  time += 1;
  return time;
} };

const mockDoc = document;
const mockEl = () => mockDoc.createElement('div');

jest.mock('../../Page', () => function MockPage() {
  const flowContent = mockEl();
  const hasOverflowed = () => flowContent.textContent.length > 10;
  const path = [];
  const getCurrent = () => {
    return path.length < 1 ? flowContent : path[path.length - 1];
  };
  return {
    path,
    element: mockEl(),
    flowContent,
    get currentElement() {
      return getCurrent();
    },
    hasOverflowed,
    validate: () => true,
    validateEnd: () => true,
    setLeftRight: () => {},
  };
});


const content = document.createElement('section');
const div = document.createElement('div');
const span = document.createElement('span');
content.textContent = 'Section Content';
div.textContent = 'Div Content';
span.textContent = 'Span Content';
content.appendChild(div);
div.appendChild(span);


test('Creates a book at all', () => {
  paginate(content, [], () => {})
    .then((book) => {
      expect(book.isComplete).toBe(true);
      const allText = book.pages
        .map(pg => pg.flowContent.textContent)
        .join('').replace(/\s+/g, ''); // whitespace not guaranteed to persist
      expect(allText).toBe('SectionContentDivContentSpanContent');
    })
    .catch(e => console.error(e));
});
