import { RegionGetter } from '../types';
import flowIntoRegions from '../flowIntoRegions';

let time = 0;
(global as any).performance = { now: () => {
  time += 1;
  return time;
} };

const mockDoc = document;
const mockEl = (name = 'div') => mockDoc.createElement(name);
let mockOverflow = (el: HTMLElement) => {
  return el.textContent!.length > 10;
};

const allText = (regions: any) => regions
  .map((region: any) => region.content.textContent)
  .join('').replace(/\s+/g, '');

const MockRegion = () => {
  const element = mockEl();
  const content = mockEl();
  element.classList.add('box');
  content.classList.add('content');
  const hasOverflowed = () => mockOverflow(content);
  const path: HTMLElement[] = [];
  const instance = {
    path,
    element,
    content,
    get currentElement() {
      return instance.path.length < 1 ? content : instance.path[instance.path.length - 1];
    },
    setPath: (newPath: HTMLElement[]) => {
      instance.path = newPath;
      if (newPath.length > 0) content.appendChild(newPath[0]);
    },
    hasOverflowed,
    isReasonableSize: true,
  };
  return instance;
};

test('Preserves content order (10char overflow)', async () => {
  const a = mockEl('div');
  const b = mockEl('p');
  const c = mockEl('span');
  a.textContent = 'A content.';
  b.textContent = 'B content.';
  c.textContent = 'C content.';
  a.appendChild(b);
  b.appendChild(c);

  const regions: any[] = [];
  const createRegion = () => {
    const r = MockRegion();
    regions.push(r);
    return r;
  };

  mockOverflow = el => el.textContent!.length > 10;
  await flowIntoRegions({
    content: a,
    createRegion: (createRegion as any as RegionGetter)
  });

  expect(regions.length).toBe(3);
  expect(allText(regions)).toBe('Acontent.Bcontent.Ccontent.');
});

test('Splits a single div over many pages (10char overflow)', async () => {
  const content = mockEl();
  content.textContent = 'A content. B content. C content.';

  const regions: any[] = [];
  const createRegion = () => {
    const r = MockRegion();
    regions.push(r);
    return r;
  };

  mockOverflow = el => el.textContent!.length > 10;
  await flowIntoRegions({
    content,
    createRegion: (createRegion as any as RegionGetter)
  });

  expect(regions.length).toBe(5);
  expect(allText(regions)).toBe('Acontent.Bcontent.Ccontent.');
  expect(regions.map(region => region.hasOverflowed()))
    .toEqual([false, false, false, false, false]);
});

test('Split elements over many pages (100char overflow)', async () => {
  const content = mockEl('section');
  let expectedText = '';
  for (let i = 0; i < 20; i += 1) {
    const e = mockEl('p');
    const txt = `Paragraph ${i}`;
    e.textContent = txt;
    expectedText += txt.replace(/\s+/g, '');
    content.appendChild(e);
  }

  const regions: any[] = [];
  const createRegion = () => {
    const r = MockRegion();
    regions.push(r);
    return r;
  };

  mockOverflow = el => el.textContent!.length > 100;
  await flowIntoRegions({
    content,
    createRegion: (createRegion as any as RegionGetter)
  });

  expect(regions.length).toBe(3);
  expect(allText(regions)).toBe(expectedText);
  expect(regions.map(region => region.element.textContent.length > 100))
    .toEqual([false, false, false]);
});
//
test('Split elements over many pages (5children overflow)', async () => {
  const content = mockEl('div');
  let expectedText = '';
  for (let i = 0; i < 20; i += 1) {
    const e = mockEl('p');
    const txt = `Paragraph ${i}`;
    e.textContent = txt;
    expectedText += txt.replace(/\s+/g, '');
    content.appendChild(e);
  }

  const regions: any[] = [];
  const createRegion = () => {
    const r = MockRegion();
    regions.push(r);
    return r;
  };

  mockOverflow = (el) => {
    const count = (el.querySelectorAll('*') || []).length;
    return count > 5;
  };
  await flowIntoRegions({
    content,
    createRegion: (createRegion as any as RegionGetter)
  });

  expect(regions.length).toBe(5);
  expect(allText(regions)).toBe(expectedText);
});

test('Spreads elements over many pages without splitting any (100char overflow)', async () => {
  const content = mockEl('section');
  let expectedText = '';
  for (let i = 0; i < 20; i += 1) {
    const e = mockEl('p');
    const txt = `Paragraph ${i}`;
    e.textContent = txt;
    expectedText += txt.replace(/\s+/g, '');
    content.appendChild(e);
  }

  const canSplit = (el: HTMLElement) => !el.matches('p');
  const regions: any[] = [];
  const createRegion = () => {
    const r = MockRegion();
    regions.push(r);
    return r;
  };

  mockOverflow = el => el.textContent!.length > 100;
  await flowIntoRegions({
    content,
    createRegion: (createRegion as any as RegionGetter),
    canSplit
  });
  expect(regions.length).toBe(3);

  const endParagraphCount = regions
    .map(region => region.content.querySelectorAll('p').length)
    .reduce((a, b) => a + b);
  expect(endParagraphCount).toBe(20);

  expect(allText(regions)).toBe(expectedText);
  expect(regions.map(region => region.element.textContent.length > 100))
    .toEqual([false, false, false]);
});

test('Throws Errors when missing required parameters', async () => {
  expect((async () => {
    await flowIntoRegions({} as any);
  })()).rejects.toThrow();

  expect((async () => {
    await flowIntoRegions({ content: true } as any);
  })()).rejects.toThrow();

  expect((async () => {
    await flowIntoRegions({ createRegion: () => false, } as any);
  })()).rejects.toThrow();

  expect((async () => {
    await flowIntoRegions({
      content: document.createElement('div'),
      createRegion: () => MockRegion(),
    } as any);
  })()).resolves.not.toThrow();
});