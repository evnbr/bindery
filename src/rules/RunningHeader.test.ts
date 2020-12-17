import RunningHeader from './RunningHeader';

// const render = jest.fn();

const pageStub = () => ({
  element: document.createElement('div'),
  number: undefined,
  runningHeader: undefined,
});

test('Renders page number by default', () => {
  const runningHeader = new RunningHeader();
  const pg = pageStub();

  pg.number = 2;
  runningHeader.eachPage(pg);
  expect(pg.runningHeader.textContent).toBe('2');

  pg.number = 3;
  runningHeader.eachPage(pg);
  expect(pg.runningHeader.textContent).toBe('3');
});
