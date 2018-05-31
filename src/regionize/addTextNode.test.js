import { addTextNode, addTextNodeUntilOverflow, addTextNodeAcrossParents } from './addTextNode';

global.performance = { now: jest.fn() };

const testContent = 'Test text content';

// ----
//
// addTextNode
describe('addTextNode', () => {
  test('cancels if page overflows', () => {
    const mockParent = document.createElement('div');
    const textNode = document.createTextNode(testContent);
    const hasOverflowed = () => true;

    addTextNode(textNode, mockParent, hasOverflowed).then((result) => {
      expect(result).toBe(false);
      expect(textNode.nodeValue).toBe(testContent);
      expect(textNode.parentNode).toBeNull();
    });
  });

  test('succeeds if page never overflows', () => {
    const mockParent = document.createElement('div');
    const textNode = document.createTextNode(testContent);
    const hasOverflowed = () => false;

    addTextNode(textNode, mockParent, hasOverflowed).then((result) => {
      expect(result).toBe(true);
      expect(textNode.nodeValue).toBe(testContent);
      expect(textNode.parentNode).toBe(mockParent);
    });
  });
});

// ----
//
// addTextUntilOverflow
describe('addTextUntilOverflow', () => {
  test('cancels if page instantly overflows', () => {
    const mockParent = document.createElement('div');
    const textNode = document.createTextNode(testContent);
    const hasOverflowed = () => true;

    addTextNodeUntilOverflow(textNode, mockParent, hasOverflowed).then((result) => {
      expect(result).toBe(false);
      expect(textNode.nodeValue).toBe(testContent);
      expect(textNode.parentNode).toBeNull();
    });
  });

  test('succeeds if content instantly fits', () => {
    const mockParent = document.createElement('div');
    const textNode = document.createTextNode(testContent);
    const hasOverflowed = () => false;

    addTextNodeUntilOverflow(textNode, mockParent, hasOverflowed).then((result) => {
      expect(result).toBe(true);
      expect(textNode.nodeValue).toBe(testContent);
      expect(textNode.parentNode).toBe(mockParent);
    });
  });

  test('cancels if page overflows when not length > 0 (ie, inline elements that collapses without content)', () => {
    const mockParent = document.createElement('div');
    const textNode = document.createTextNode(testContent);
    const page = () => textNode.nodeValue !== '';

    addTextNodeUntilOverflow(textNode, mockParent, page).then((result) => {
      expect(result).toBe(false);
      expect(textNode.nodeValue).toBe(testContent);
      expect(textNode.parentNode).toBeNull();
    });
  });

  test('succeeds when break on word boundary', () => {
    const mockParent = document.createElement('div');
    const textNode = document.createTextNode(testContent);
    const hasOverflowed = () => textNode.nodeValue.length > 4;

    return addTextNodeUntilOverflow(textNode, mockParent, hasOverflowed).then((result) => {
      expect(textNode.nodeValue).toBe('Test');
      expect(textNode.parentNode).toBe(mockParent);
      expect(result.nodeType).toBe(Node.TEXT_NODE);
      expect(result.nodeValue).toBe(' text content');
      expect(result.parentNode).toBeNull();
    });
  });

  test('backs up to word boundary', () => {
    const mockParent = document.createElement('div');
    const textNode = document.createTextNode(testContent);
    const hasOverflowed = () => textNode.nodeValue.length > 7;

    return addTextNodeUntilOverflow(textNode, mockParent, hasOverflowed).then((result) => {
      expect(textNode.nodeValue).toBe('Test');
      expect(textNode.parentNode).toBe(mockParent);
      expect(result.nodeType).toBe(Node.TEXT_NODE);
      expect(result.nodeValue).toBe(' text content');
      expect(result.parentNode).toBeNull();
    });
  });

  test('cancels entirely when backing up past first word', () => {
    const mockParent = document.createElement('div');
    const textNode = document.createTextNode(testContent);
    const hasOverflowed = () => textNode.nodeValue.length > 2;

    return addTextNodeUntilOverflow(textNode, mockParent, hasOverflowed).then((result) => {
      expect(result).toBe(false);
      expect(textNode.nodeValue).toBe(testContent);
      expect(textNode.parentNode).toBeNull();
    });
  });
});

// ----
//
// addTextNodeAcrossParents
describe('addTextNodeAcrossParents', () => {
  test('doesn\'t fit', () => {
    const textNode = document.createTextNode(testContent);
    const p1 = document.createElement('div');
    const next = () => false;
    const hasOverflowed = () => true;

    return addTextNodeAcrossParents(textNode, p1, next, hasOverflowed).then((result) => {
      expect(result).toBe(false);
      expect(p1.textContent).toBe('');
    });
  });

  test('fits on one new page', () => {
    const textNode = document.createTextNode(testContent);
    const p1 = document.createElement('div');
    const p2 = document.createElement('div');
    const next = () => p2;
    const hasOverflowed = () => false;

    return addTextNodeAcrossParents(textNode, p1, next, hasOverflowed).then((result) => {
      expect(result).toBe(true);
      expect(p1.textContent).toBe(testContent);
      expect(p2.textContent).toBe('');
    });
  });

  test('across two pages', () => {
    const textNode = document.createTextNode(testContent);
    const p1 = document.createElement('div');
    const p2 = document.createElement('div');
    const next = () => p2;
    const hasOverflowed = () => p1.textContent.length > 4;

    return addTextNodeAcrossParents(textNode, p1, next, hasOverflowed).then((result) => {
      expect(result).toBe(true);
      expect(p1.textContent).toBe('Test');
      expect(p2.textContent).toBe(' text content');
    });
  });

  test('across three pages', () => {
    const textNode = document.createTextNode(testContent);
    const p1 = document.createElement('div');
    const p2 = document.createElement('div');
    const p3 = document.createElement('div');
    const nextPages = [p3, p2];
    const next = () => nextPages.pop();
    const hasOverflowed = () => p1.textContent.length > 4 || p2.textContent.length > 6;

    return addTextNodeAcrossParents(textNode, p1, next, hasOverflowed).then((result) => {
      expect(result).toBe(true);
      // expect(nextPages.length).toBe(0);
      expect(p1.textContent).toBe('Test');
      expect(p2.textContent).toBe(' text');
      expect(p3.textContent).toBe(' content');
    });
  });
});
