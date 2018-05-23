import Book from '../Book';

let book;
beforeEach(() => {
  book = new Book();
});

test('Page count works', () => {
  expect(book.pageCount).toBe(0);

  book.pages.push({});
  book.pages.push({});
  book.pages.push({});

  expect(book.pageCount).toBe(3);
});

test('Validates when book is short', () => {
  expect(book.pageCount).toBe(0);

  book.pages.push({});

  expect(() => {
    book.validate();
  }).not.toThrow();
});

test('Throws when book seems too long', () => {
  expect(book.pageCount).toBe(0);

  for (let i = 0; i < 3000; i += 1) {
    book.pages.push({});
  }

  expect(() => {
    book.validate();
  }).toThrow();
});
