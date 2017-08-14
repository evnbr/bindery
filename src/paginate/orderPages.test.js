import orderPages from './orderPages';

const newPageMock = jest.fn();
newPageMock.mockReturnValue({ newPage: true });

beforeEach(() => {
  newPageMock.mockClear();
});

const blankPages = [
  { num: 1 },
  { num: 2 },
  { num: 3 },
  { num: 4 },
];

test('Doesn\'t modify blank pages', () => {
  expect(orderPages(blankPages, newPageMock)).toEqual(blankPages);
  expect(newPageMock).not.toBeCalled();
});

const leftPages = [
  { alwaysLeft: true },
  { alwaysLeft: true },
  { alwaysLeft: true },
  { alwaysLeft: true },
];

test('Adds new pages when left/right conflicts', () => {
  expect(orderPages(leftPages, newPageMock)).toHaveLength(leftPages.length * 2);
  expect(newPageMock.mock.calls.length).toBe(leftPages.length);
});

const leftRightPages = [
  { alwaysRight: true },
  { alwaysLeft: true },
  { alwaysRight: true },
  { alwaysLeft: true },
];

test('Doesn\'t add padding when left/right works out', () => {
  expect(orderPages(leftRightPages, newPageMock)).toEqual(leftRightPages);
  expect(newPageMock).not.toBeCalled();
});

const outOfFlowPages = [
  { num: 1 },
  { num: 2 },
  { num: 3, alwaysLeft: true, isOutOfFlow: true },
  { num: 4, alwaysRight: true, isOutOfFlow: true },
  { num: 5 },
  { num: 6 },
];
const outOfFlowPagesIntended = [
  { num: 1 },
  { num: 2 },
  { num: 5 },
  { num: 3, alwaysLeft: true, isOutOfFlow: true },
  { num: 4, alwaysRight: true, isOutOfFlow: true },
  { num: 6 },
];

test('Moves outOfFlow pages rather than adding padding', () => {
  // expect(orderPages(outOfFlowPages, newPageMock)).toHaveLength(outOfFlowPages.length);
  expect(orderPages(outOfFlowPages, newPageMock)).toEqual(outOfFlowPagesIntended);
  expect(newPageMock).not.toBeCalled();
});
