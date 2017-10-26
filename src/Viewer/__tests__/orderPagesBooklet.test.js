import orderPagesBooklet from '../orderPagesBooklet';

const makePage = function () {
  return { element: document.createElement('div') };
};

test('Orders 8', () => {
  const pages = [
    makePage(),
    makePage(),
    makePage(),
    makePage(),
    makePage(),
    makePage(),
    makePage(),
    makePage(),
  ];

  const ordered = orderPagesBooklet(pages, makePage);

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
