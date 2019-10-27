import ensureImageLoaded from '../ensureImageLoaded';

(global as any).performance = { now: jest.fn() };

test('Returns when image gets naturalWidth', async (done) => {
  const mockImage = {
    src: 'test.jpg',
    naturalWidth: false,
    addEventListener: () => {},
  };

  setTimeout(() => {
    mockImage.naturalWidth = true;
  }, 100);

  await ensureImageLoaded(mockImage as any as HTMLImageElement);
  done();
});

test('Error listener also returns', async (done) => {
  let errorListener: Function;
  const mockImage = {
    src: 'test.jpg',
    naturalWidth: false,
    addEventListener: (name: string, func: Function) => {
      errorListener = func;
    },
  };
  setTimeout(() => {
    errorListener();
  }, 100);
  await ensureImageLoaded(mockImage as any as HTMLImageElement);
  done();
});
