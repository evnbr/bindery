const waitForImage = (image, done) => {
  const fileName = image.src.substring(image.src.lastIndexOf('/') + 1);
  // console.log(`Bindery: Waiting for image '${fileName}' size to load`);

  const pollForSize = setInterval(() => {
    if (image.naturalWidth) {
      clearInterval(pollForSize);
      done();
    }
  }, 10);

  image.addEventListener('error', () => {
    clearInterval(pollForSize);
    console.error(`Bindery: Image '${fileName}' failed to load.`);
    done();
  });
  image.src = image.src;
};

export default waitForImage;
