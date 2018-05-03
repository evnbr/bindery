import ensureImageLoaded from '../ensureImageLoaded';

global.performance = { now: jest.fn() };

test('Returns when image gets naturalWidth', async (done) => {
  const mockImage = {
    src: 'test.jpg',
    addEventListener: () => {},
  };

  setTimeout(() => {
    mockImage.naturalWidth = true;
  }, 100);

  await ensureImageLoaded(mockImage);
  done();
});

test('Error listener also returns', (done) => {
  let errorListener;
  const mockImage = {
    src: 'test.jpg',
    addEventListener: (name, func) => {
      errorListener = func;
    },
  };

  ensureImageLoaded(mockImage).then(done);

  setTimeout(() => {
    errorListener();
  }, 100);
});
