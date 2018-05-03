// Note: Doesn't ever reject, since missing images
// shouldn't prevent layout from resolving

const wait10 = () => new Promise((resolve) => {
  setTimeout(() => { resolve(); }, 10);
});

const waitForImage = async (image) => {
  let failed = false;
  image.addEventListener('error', () => { failed = true; });
  image.src = image.src;

  while (!image.naturalWidth && !failed) {
    await wait10();
  }
};

export default waitForImage;
