import Region from '../Region';
import tryInNextRegion from '../tryInNextRegion';
import clonePath from '../clonePath';

const el = () => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode('text content'));
  return div;
};

const noop = () => {};
const mockRegion = (path?: HTMLElement[]) => {
  const flow = new Region(document.createElement('div'));
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

let a: HTMLElement;
let b: HTMLElement;
let c: HTMLElement;
let d: HTMLElement;
beforeEach(() => {
  a = el();
  b = el();
  c = el();
  d = el();
});

test('Shifts one element when none of its parents complain', () => {
  const firstRegion = mockRegion([a, b, c, d]);
  const nextRegion = mockRegion();
  const next = () => {
    const newPath = clonePath(firstRegion.path, noop);
    nextRegion.setPath(newPath);
    return nextRegion;
  };
  const canSplit = () => true;

  tryInNextRegion(firstRegion, next, canSplit);
  expect(firstRegion.path).toEqual([a, b, c]);
  expect(nextRegion.path[0].tagName).toBe(a.tagName);
  expect(nextRegion.path[1].tagName).toBe(b.tagName);
  expect(nextRegion.path[2].tagName).toBe(c.tagName);
  expect(nextRegion.path[3]).toBe(d);
});

test('Shifts two elements when parent would be empty', () => {
  c.textContent = '';
  const firstRegion = mockRegion([a, b, c, d]);
  const nextRegion = mockRegion();
  const next = () => {
    const newPath = clonePath(firstRegion.path, noop);
    nextRegion.setPath(newPath);
    return nextRegion;
  };
  const canSplit = () => true;

  tryInNextRegion(firstRegion, next, canSplit);
  expect(firstRegion.path).toEqual([a, b]);
  expect(nextRegion.path[0].tagName).toBe(a.tagName);
  expect(nextRegion.path[1].tagName).toBe(b.tagName);
  expect(nextRegion.path[2]).toBe(c);
  expect(nextRegion.path[3]).toBe(d);
});

test('Shifts two elements when parent can\t split', () => {
  const firstRegion = mockRegion([a, b, c, d]);
  const nextRegion = mockRegion();
  const next = () => {
    const newPath = clonePath(firstRegion.path, noop);
    nextRegion.setPath(newPath);
    return nextRegion;
  };
  const canSplit = (elmt: HTMLElement) => elmt !== c;

  tryInNextRegion(firstRegion, next, canSplit);
  expect(firstRegion.path).toEqual([a, b]);
  expect(nextRegion.path[1].tagName).toBe(b.tagName);
  expect(nextRegion.path[2]).toBe(c);
  expect(nextRegion.path[3]).toBe(d);
});

test('Shifts three elements when grandparent can\t split', () => {
  const firstRegion = mockRegion([a, b, c, d]);
  const nextRegion = mockRegion();
  const next = () => {
    const newPath = clonePath(firstRegion.path, noop);
    nextRegion.setPath(newPath);
    return nextRegion;
  };
  const canSplit = (elmt: HTMLElement) => elmt !== c && elmt !== b;

  tryInNextRegion(firstRegion, next, canSplit);
  expect(firstRegion.path).toEqual([a]);
  expect(nextRegion.path[0].tagName).toBe(a.tagName);
  expect(nextRegion.path[1]).toBe(b);
  expect(nextRegion.path[2]).toBe(c);
  expect(nextRegion.path[3]).toBe(d);
});

test('Does not shift elements if whole firstRegion would be empty', () => {
  a.textContent = '';
  const firstRegion = mockRegion([a, b, c, d]);
  const nextRegion = mockRegion();
  const next = () => {
    const newPath = clonePath(firstRegion.path, noop);
    nextRegion.setPath(newPath);
    return nextRegion;
  };
  const canSplit = () => false;

  tryInNextRegion(firstRegion, next, canSplit);
  expect(firstRegion.path).toEqual([a, b, c, d]);
  expect(nextRegion.path).toEqual([]);
});
