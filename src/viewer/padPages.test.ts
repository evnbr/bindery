import padPages from './padPages';

const makePage = function() {
  return { element: document.createElement('div') };
};

test('Adds front and back pages', () => {
  const pages = [makePage(), makePage()];
  const padded = padPages(pages, makePage);
  expect(padded.length).toBe(4);
});

test('Adds a page when odd number', () => {
  const pages = [makePage(), makePage(), makePage()];
  const padded = padPages(pages, makePage);
  expect(padded.length).toBe(6);
});
