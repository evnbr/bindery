const sec = (ms) => (ms / 1000).toFixed(2);

const estimateFor = (content) => {
  const start = window.performance.now();
  const capacity = content.querySelectorAll('*').length;
  let timeWaiting = 0;
  let completed = 0;

  return {
    increment: () => { completed += 1; },
    addWaitTime: (t) => { timeWaiting += t; },
    get progress() { return completed / capacity; },
    end: () => {
      const end = window.performance.now();
      const total = end - start;
      const layout = total - timeWaiting;

      const pt1 = `📖 Layout ready in ${sec(layout)}s`;
      const pt2 = timeWaiting > 0 ? `(plus ${sec(timeWaiting)}s waiting for images)` : '';
      console.log(`${pt1} ${pt2}`);
    },
  };
};

export default estimateFor;
