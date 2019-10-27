const MAX_TIME = 30; // ms

const rAF = (): Promise<number> => new Promise((resolve) => {
  requestAnimationFrame(t => resolve(t));
});

let lastYieldTime = 0;

const shouldYield = (): boolean => {
  const timeSinceYield = performance.now() - lastYieldTime;
  return timeSinceYield > MAX_TIME;
};

const yieldIfNecessary = async (): Promise<void> => {
  if (shouldYield()) lastYieldTime = await rAF();
};

export { shouldYield, yieldIfNecessary };
