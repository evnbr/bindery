import Bindery from './bindery';

global.BINDERY_VERSION = 'Test Version';

test('Throws with no content', () => {
  expect(() => {
    const _ = new Bindery();
  }).toThrow();
});

test('Sets up content', async () => {
  const div = document.createElement('div');
  const bindery = new Bindery({ content: div });
  setTimeout(async () => {
    expect(bindery.content).toBeTruthy();
    const book = await bindery.makeBook();
    expect(book).toBeTruthy();
    expect(book.pageCount > 0).toBe(true);
  }, 10);
});
