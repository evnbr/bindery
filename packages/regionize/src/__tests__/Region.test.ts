import Region from '../Region';

const setMockHeight = (el: HTMLElement, fakeHeight: number) => {
  Object.defineProperty(el, 'offsetHeight', {
    get: jest.fn(() => { return fakeHeight; }),
    configurable: true,
  });  
}


test('Region addes a content element', () => {
  const div = document.createElement('div');
  const region = new Region(div);

  expect(region.element).toBe(div);
  expect(region.content).toBe(div.firstElementChild);
});

test('Region isEmpty works', () => {
  const div = document.createElement('div');
  const textNode = document.createTextNode('content');
  const region = new Region(div);

  expect(region.isEmpty).toBe(true);

  region.currentElement.appendChild(textNode);

  expect(region.isEmpty).toBe(false);
});

test('Region isReasonableSize works', () => {
  const div = document.createElement('div');
  const region = new Region(div);

  Element.prototype.getBoundingClientRect = jest.fn(() => {
    return { width: 20, height: 20 };
  });
  expect(region.isReasonableSize).toBe(false);

  Element.prototype.getBoundingClientRect = jest.fn(() => {
    return { width: 120, height: 120 };
  });
  expect(region.isReasonableSize).toBe(true);
});

test('Region hasOverflowed works', () => {
  const div = document.createElement('div');
  const region = new Region(div);
  
  setMockHeight(div, 100);

  setMockHeight(region.content, 20);
  expect(region.hasOverflowed()).toBe(false);

  setMockHeight(region.content, 100);
  expect(region.hasOverflowed()).toBe(true);

  setMockHeight(region.content, 90);
  expect(region.hasOverflowed()).toBe(false);

  setMockHeight(region.content, 120);
  expect(region.hasOverflowed()).toBe(true);
});

test('Region hasOverflowed throws on zero height', () => {
  const div = document.createElement('div');
  const region = new Region(div);

  setMockHeight(div, 0);

  expect(() => {
    region.hasOverflowed();
  }).toThrow();
});