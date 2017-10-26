import waitForImage from '../waitForImage';

test('Returns when image has naturalWidth', (done) => {
  const img = {
    src: 'test.jpg',
    naturalWidth: true,
    addEventListener: () => {},
  };
  waitForImage(img, () => {
    done();
  });
});
