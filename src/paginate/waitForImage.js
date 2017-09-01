const waitForImage = (image, done) => {
  console.log(`Bindery: Waiting for image '${image.src}' size to load`);

  const pollForSize = setInterval(() => {
    if (image.naturalWidth) {
      clearInterval(pollForSize);
      console.log(`Bindery: Image '${image.src}' size loaded.`);
      done();
    }
  }, 10);

  image.addEventListener('error', () => {
    clearInterval(pollForSize);
    console.error(`Bindery: Image '${image.src}' failed to load.`);
    done();
  });
  image.src = image.src;
};

export default waitForImage;
