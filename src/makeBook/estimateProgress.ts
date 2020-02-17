const sec = (ms: number) => (ms / 1000).toFixed(2);

const estimateFor = (content) => {
  const start = window.performance.now();
  const capacity = content.querySelectorAll('*').length;
  let timeWaiting = 0;
  let completed = 0;

  return {
    increment: () => { completed += 1; },
    addWaitTime: (t: number) => { timeWaiting += t; },
    get progress() { return completed / capacity; },
    end: () => {
      const end = window.performance.now();
      const total = end - start;
      const layout = total - timeWaiting;
      console.log(`📖 Layout ready in ${sec(layout)}s (plus ${sec(timeWaiting)}s waiting for images)`);
    },
  };
};

export default estimateFor;
