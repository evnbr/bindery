import PageReference from './PageReference';

const createEl = (tag, txt) => {
  const el = document.createElement(tag);
  if (txt) el.textContent = txt;
  return el;
};

const pageRef = new PageReference({ selector: 'a' });
// disable throttling
pageRef.throttledUpdate = book => pageRef.updatePageReferences(book.pages);

const book = {
  pages: [
    { element: createEl('div'), number: 0 },
    { element: createEl('div'), number: 1 },
    { element: createEl('div'), number: 2 },
    { element: createEl('div'), number: 3 },
  ],
};

const toc = createEl('a', 'Read more');
toc.href = '#chapter1';
book.pages[0].element.appendChild(toc);

const h2 = createEl('h2', 'Chapter 1');
h2.id = 'chapter1';
book.pages[2].element.appendChild(h2);

test('blank pageRef gets created', () => {
  const newToc = pageRef.afterAdd(toc, book);
  expect(newToc.textContent).toBe('Read more, ?');
});

test('pageRef gets updated', () => {
  pageRef.eachPage(null, book);
  const newToc = book.pages[0].element.querySelector('a');
  expect(newToc.textContent).toBe('Read more, 2');
});

test('pageRef gets updated if page numbers change', () => {
  book.pages[2].number = 7;
  pageRef.eachPage(null, book);
  const newToc = book.pages[0].element.querySelector('a');
  expect(newToc.textContent).toBe('Read more, 7');
});
