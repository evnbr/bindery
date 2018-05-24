import annotatePages from '../annotatePages';


const create = (tag, txt) => {
  const el = document.createElement(tag);
  el.textContent = txt;
  return el;
};

const pageStub = () => ({
  element: create('div'),
  setLeftRight: () => {},
});
const h1 = txt => create('h1', txt);
const h2 = txt => create('h2', txt);
const h3 = txt => create('h3', txt);

const pages = [
  pageStub(),
  pageStub(),
  pageStub(),
  pageStub(),
  pageStub(),
  pageStub(),
];

pages[0].element.appendChild(h1('1'));
pages[1].element.appendChild(h2('1.1'));
pages[2].element.appendChild(h3('1.1.1'));
pages[3].element.appendChild(h2('1.2'));
pages[4].element.appendChild(h1('2'));
pages[5].element.appendChild(h3('2.1.1'));

test('Pages are annotated', () => {
  annotatePages(pages);

  expect(pages[0].heading.h1).toBe('1');
  expect(pages[0].heading.h2).toBeUndefined();
  expect(pages[0].heading.h3).toBeUndefined();

  expect(pages[1].heading.h1).toBe('1');
  expect(pages[1].heading.h2).toBe('1.1');
  expect(pages[1].heading.h3).toBeUndefined();

  expect(pages[2].heading.h1).toBe('1');
  expect(pages[2].heading.h2).toBe('1.1');
  expect(pages[2].heading.h3).toBe('1.1.1');

  expect(pages[3].heading.h1).toBe('1');
  expect(pages[3].heading.h2).toBe('1.2');
  expect(pages[3].heading.h3).toBeUndefined();

  expect(pages[4].heading.h1).toBe('2');
  expect(pages[4].heading.h2).toBeUndefined();
  expect(pages[4].heading.h3).toBeUndefined();

  expect(pages[5].heading.h1).toBe('2');
  expect(pages[5].heading.h2).toBeUndefined();
  expect(pages[5].heading.h3).toBe('2.1.1');
});
