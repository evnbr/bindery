import Bindery from './bindery';
import Rules from './rules';

global.BINDERY_VERSION = 'Test Version';
global.console = { // to cleanup test console
  log: () => {},
  error: () => {},
};
global.fetch = async () => ({
  status: 200,
  text: () => '<div id="content">Test Content<div>',
});

const wait10 = () => new Promise(resolve => setTimeout(resolve, 10));

const mockDoc = document;
const mockEl = (name = 'div') => mockDoc.createElement(name);
const mockOverflow = el => el.textContent.length > 10;
let mockReasonableSize = () => true;

const mockRegion = function () {
  const box = mockEl();
  const content = mockEl();
  box.classList.add('box');
  content.classList.add('content');
  const hasOverflowed = () => mockOverflow(content);
  const path = [];
  const instance = {
    path,
    element: box,
    content,
    get currentElement() {
      return instance.path.length < 1 ? content : instance.path[instance.path.length - 1];
    },
    setPath: (newPath) => {
      instance.path = newPath;
      if (newPath.length > 0) content.appendChild(newPath[0]);
    },
    hasOverflowed,
    get isReasonableSize() {
      return mockReasonableSize();
    },
  };
  return instance;
};

const regionize = require('regionize');

regionize.Region = mockRegion;

test('Throws with no content', () => {
  expect(() => {
    const bindery = new Bindery();
    bindery.cancel();
  }).toThrow();
});

test('Sets up content for div', async () => {
  const div = document.createElement('div');
  const bindery = new Bindery({ content: div });
  await wait10(); // TODO: hack because content not ready?
  expect(bindery.content instanceof HTMLElement).toBe(true);
});

test('Sets up content from url', async () => {
  const bindery = new Bindery({ content: { url: 'fakeurl', selector: '#content' } });
  await wait10(); // TODO: hack because content not ready?
  expect(bindery.content instanceof HTMLElement).toBe(true);
});


test('Throws with invalid Rule', () => {
  expect(() => {
    const bindery = new Bindery({
      content: document.createElement('div'),
      rules: [{ k: 'Not instance of Rule' }],
    });
    bindery.cancel();
  }).toThrow();
});


test('Doesnt throw with valid Rule', () => {
  expect(() => {
    const bindery = new Bindery({
      content: document.createElement('div'),
      rules: [Rules.PageBreak({})],
    });
    bindery.cancel();
  }).not.toThrow();
});


test('Displays error when page doesnt validate', async () => {
  mockReasonableSize = () => false;

  const div = document.createElement('div');
  const bindery = new Bindery({ content: div });
  await wait10(); // TODO: hack because content not ready?
  const book = await bindery.makeBook();
  expect(book).toBeNull();
  expect(bindery.viewer.isViewing).toBe(true);
  expect(bindery.viewer.error instanceof HTMLElement).toBe(true);
  expect(bindery.viewer.element.contains(bindery.viewer.error)).toBe(true);
});

test('Creates book when there\'s content', async () => {
  mockReasonableSize = () => true;

  const div = document.createElement('div');
  const bindery = new Bindery({ content: div });
  await wait10(); // TODO: hack because content not ready?
  const book = await bindery.makeBook();
  expect(book).toBeTruthy();
  expect(book.pageCount > 0).toBe(true);
});
