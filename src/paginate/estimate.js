import ensureImageLoaded from './ensureImageLoaded';

const sec = ms => (ms / 1000).toFixed(2);

const estimate = (content) => {
  const start = window.performance.now();
  const capacity = content.querySelectorAll('*').length;
  let timeWaiting = 0;
  let completed = 0;

  return {
    increment: () => { completed += 1; },
    progress: () => completed / capacity,
    ensureImageLoaded: async (img) => {
      const imgWait = await ensureImageLoaded(img);
      timeWaiting += imgWait;
    },
    end: () => {
      const end = window.performance.now();
      const total = end - start;
      const layout = total - timeWaiting;
      console.log(`📖 Book ready in ${sec(total)}s (Layout: ${sec(layout)}s, waiting for images: ${sec(timeWaiting)}s)`);
    },
  };
};

export default estimate;
