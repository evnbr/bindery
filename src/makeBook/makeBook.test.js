import makeBook from './makeBook';

let time = 0;
global.performance = { now: () => {
  time += 1;
  return time;
} };

const mockDoc = document;
const mockEl = (name = 'div') => mockDoc.createElement(name);
let mockOverflow = el => el.textContent.length > 10;

const mockRegion = function () {
  const box = mockEl();
  const content = mockEl();
  box.classList.add('box');
  content.classList.add('content');
  const hasOverflowed = () => mockOverflow(content);
  const path = [];
  const instance = {
    path,
    element: box,
    content,
    get currentElement() {
      return instance.path.length < 1 ? content : instance.path[instance.path.length - 1];
    },
    setPath: (newPath) => {
      instance.path = newPath;
      if (newPath.length > 0) content.appendChild(newPath[0]);
    },
    hasOverflowed,
    isReasonableSize: true,
  };
  return instance;
};


jest.unmock('regionize');
const regionize = require('regionize');

regionize.Region = mockRegion;


// jest.mock('regionize', function MockRegionize() {
//   return {
//     flowIntoRegions: mockFlowIntoRegions,
//     Region: mockRegion,
//   };
// });


test('Creates book, preserves content order (10char overflow)', async () => {
  const a = mockEl('div');
  const b = mockEl('p');
  const c = mockEl('span');
  a.textContent = 'A content.';
  b.textContent = 'B content.';
  c.textContent = 'C content.';
  a.appendChild(b);
  b.appendChild(c);

  mockOverflow = el => el.textContent.length > 10;
  const book = await makeBook(a, [], () => {});
  expect(book.pageCount).toBe(3);

  const allText = book.pages
    .map(pg => pg.flow.content.textContent)
    .join('').replace(/\s+/g, ''); // whitespace not guaranteed to persist

  expect(allText).toBe('Acontent.Bcontent.Ccontent.');
});

test('Splits a single div over many pages (10char overflow)', async () => {
  const content = mockEl();
  content.textContent = 'A content. B content. C content.';

  mockOverflow = el => el.textContent.length > 10;
  const book = await makeBook(content, [], () => {});
  expect(book.pageCount).toBe(5);

  const allText = book.pages
    .map(pg => pg.flow.content.textContent)
    .join('').replace(/\s+/g, ''); // whitespace not guaranteed to persist
  expect(allText).toBe('Acontent.Bcontent.Ccontent.');

  expect(book.pages.map(pg => pg.hasOverflowed()))
    .toEqual([false, false, false, false, false]);
});

test('Split elements over many pages (100char overflow)', async () => {
  const content = mockEl('section');
  let expectedText = '';
  for (let i = 0; i < 20; i += 1) {
    const e = mockEl('p');
    const txt = `Paragraph ${i}`;
    e.textContent = txt;
    expectedText += txt.replace(/\s+/g, '');
    content.appendChild(e);
  }

  mockOverflow = el => el.textContent.length > 100;
  const book = await makeBook(content, [], () => {});
  expect(book.pageCount).toBe(3);

  const actualText = book.pages
    .map(pg => pg.flow.content.textContent)
    .join('').replace(/\s+/g, ''); // whitespace not guaranteed to persist
  expect(actualText).toBe(expectedText);
  expect(book.pages.map(pg => pg.element.textContent.length > 100))
    .toEqual([false, false, false]);
});

test('Split elements over many pages (5children overflow)', async () => {
  const content = mockEl('div');
  let expectedText = '';
  for (let i = 0; i < 20; i += 1) {
    const e = mockEl('p');
    const txt = `Paragraph ${i}`;
    e.textContent = txt;
    expectedText += txt.replace(/\s+/g, '');
    content.appendChild(e);
  }

  mockOverflow = (el) => {
    const count = (el.querySelectorAll('*') || []).length;
    return count > 5;
  };
  const book = await makeBook(content, [], () => {});
  expect(book.pageCount).toBe(5);

  const actualText = book.pages
    .map(pg => pg.flow.content.textContent)
    .join('').replace(/\s+/g, ''); // whitespace not guaranteed to persist
  expect(actualText).toBe(expectedText);
});

test('Spreads elements over many pages without splitting any (100char overflow)', async () => {
  const content = mockEl('section');
  let expectedText = '';
  for (let i = 0; i < 20; i += 1) {
    const e = mockEl('p');
    const txt = `Paragraph ${i}`;
    e.textContent = txt;
    expectedText += txt.replace(/\s+/g, '');
    content.appendChild(e);
  }

  const rule = { selector: 'p', avoidSplit: true };

  mockOverflow = el => el.textContent.length > 100;
  const book = await makeBook(content, [rule], () => {});
  expect(book.pageCount).toBe(3);

  const endParagraphCount = book.pages
    .map(pg => pg.flow.content.querySelectorAll('p').length)
    .reduce((a, b) => a + b);
  expect(endParagraphCount).toBe(20);

  const actualText = book.pages
    .map(pg => pg.flow.content.textContent)
    .join('').replace(/\s+/g, ''); // whitespace not guaranteed to persist
  expect(actualText).toBe(expectedText);
  expect(book.pages.map(pg => pg.element.textContent.length > 100))
    .toEqual([false, false, false]);
});
