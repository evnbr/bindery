import FlowBox from '../../flow-box';
import tryInNextBox from '../tryInNextBox';

const el = () => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode('text content'));
  return div;
};

const mockFlow = (path) => {
  const flow = new FlowBox();
  if (path) {
    flow.content.appendChild(path[0]);
    for (let i = 0; i < path.length - 1; i += 1) {
      path[i].appendChild(path[i + 1]);
    }
    flow.path = path;
  } else {
    flow.path = [];
  }
  flow.hasOverflowed = () => false;
  return flow;
};

let a;
let b;
let c;
let d;
beforeEach(() => {
  a = el();
  b = el();
  c = el();
  d = el();
});

test('Shifts one element when none of its parents complain', () => {
  const page = mockFlow([a, b, c, d]);
  const nextFlow = mockFlow();
  const next = () => nextFlow;
  const canSplit = () => true;

  tryInNextBox(page, next, canSplit);
  expect(page.path).toEqual([a, b, c]);
  expect(nextFlow.path).toEqual([d]);
});

test('Shifts two elements when parent would be empty', () => {
  c.textContent = '';
  const page = mockFlow([a, b, c, d]);
  const nextFlow = mockFlow();
  const next = () => nextFlow;
  const canSplit = () => true;

  tryInNextBox(page, next, canSplit);
  expect(page.path).toEqual([a, b]);
  expect(nextFlow.path).toEqual([c, d]);
});

test('Shifts two elements when parent can\t split', () => {
  const page = mockFlow([a, b, c, d]);
  const nextFlow = mockFlow();
  const next = () => nextFlow;
  const canSplit = elmt => elmt !== c;

  tryInNextBox(page, next, canSplit);
  expect(page.path).toEqual([a, b]);
  expect(nextFlow.path).toEqual([c, d]);
});

test('Shifts three elements when grandparent can\t split', () => {
  const page = mockFlow([a, b, c, d]);
  const nextFlow = mockFlow();
  const next = () => nextFlow;
  const canSplit = elmt => elmt !== c && elmt !== b;

  tryInNextBox(page, next, canSplit);
  expect(page.path).toEqual([a]);
  expect(nextFlow.path).toEqual([b, c, d]);
});

test('Does not shift elements if whole page would be empty', () => {
  a.textContent = '';
  const page = mockFlow([a, b, c, d]);
  const nextFlow = mockFlow();
  const next = () => false;
  const canSplit = () => false;

  tryInNextBox(page, next, canSplit);
  expect(page.path).toEqual([a, b, c, d]);
  expect(nextFlow.path).toEqual([]);
});
