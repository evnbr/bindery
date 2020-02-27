import orderPagesBooklet from './orderPagesBooklet';

const pageStub = () => ({ element: document.createElement('div') });

test('Orders 8', () => {
  const pages = [
    pageStub(),
    pageStub(),
    pageStub(),
    pageStub(),
    pageStub(),
    pageStub(),
    pageStub(),
    pageStub(),
  ];

  const ordered = orderPagesBooklet(pages, pageStub);

  expect(ordered).toEqual([
    // cover
    pages[7],
    pages[0],

    // inside cover
    pages[1],
    pages[6],

    // outside
    pages[5],
    pages[2],

    // inside
    pages[3],
    pages[4],
  ]);
});

test('Adds pages to end when not divisible by 4', () => {
  const pages = [pageStub(), pageStub(), pageStub(), pageStub(), pageStub()];

  const ordered = orderPagesBooklet(pages, pageStub);

  expect(ordered.length).toBe(8);
  expect(ordered[1]).toBe(pages[0]);
  expect(ordered[2]).toBe(pages[1]);
  expect(ordered[5]).toBe(pages[2]);
  expect(ordered[6]).toBe(pages[3]);
  expect(ordered[7]).toBe(pages[4]);
});
