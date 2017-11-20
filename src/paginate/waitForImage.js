import Thenable from './Thenable';

// Note: Doesn't ever reject, since missing images
// shouldn't prevent layout from resolving

const waitForImage = image => new Thenable((resolve) => {
  const pollForSize = setInterval(() => {
    if (image.naturalWidth) {
      clearInterval(pollForSize);
      resolve();
    }
  }, 10);

  image.addEventListener('error', () => {
    clearInterval(pollForSize);
    resolve();
  });
  image.src = image.src;
});

export default waitForImage;
