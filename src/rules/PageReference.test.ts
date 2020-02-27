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

test('TOC placeholder gets created if target is not yet in the book', () => {
  const toc = createEl('a', 'Read more');
  toc.href = '#chapter1';
  book.pages[0].element.appendChild(toc);

  const newToc = pageRef.afterAdd(toc, book);
  expect(newToc.textContent).toBe('Read more, ⌧');
});

test('TOC gets rendered after result is in book', () => {
  const h2 = createEl('h2', 'Chapter 1');
  h2.id = 'chapter1';
  book.pages[2].element.appendChild(h2);

  pageRef.eachPage(null, book);
  const newToc = book.pages[0].element.querySelector('a');
  expect(newToc.textContent).toBe('Read more, 2');
});

test('Indexes instantly fills if added after target', () => {
  const index = createEl('a', 'Turn Back');
  index.href = '#chapter1';
  book.pages[3].element.appendChild(index);

  const newIndex = pageRef.afterAdd(index, book);
  expect(newIndex.textContent).toBe('Turn Back, 2');
});

test('TOC gets updated if page numbers change', () => {
  book.pages[2].number = 7;

  pageRef.eachPage(null, book);
  const newToc = book.pages[0].element.querySelector('a');
  expect(newToc.textContent).toBe('Read more, 7');
});
