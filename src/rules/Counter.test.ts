import Counter from './Counter';

// const render = jest.fn();

const createEl = tag => document.createElement(tag);

const counter = new Counter({
  replaceEl: 'span',
  resetEl: 'h1',
  incrementEl: 'p'
});
counter.setup();

test('increments and resets', () => {
  expect(counter.counterValue).toBe(0);

  const p = createEl('p');

  counter.beforeAdd(p);
  expect(counter.counterValue).toBe(1);

  counter.beforeAdd(p);
  expect(counter.counterValue).toBe(2);

  const h1 = createEl('h1');
  counter.beforeAdd(h1);
  expect(counter.counterValue).toBe(0);

  counter.beforeAdd(p);
  expect(counter.counterValue).toBe(1);
});

test('renders current value', () => {
  counter.counterValue = 0;

  const span = createEl('span');
  counter.beforeAdd(span);
  expect(span.textContent).toBe('0');

  counter.counterValue = 2;

  const span2 = createEl('span');
  counter.beforeAdd(span2);
  expect(span2.textContent).toBe('2');
});
