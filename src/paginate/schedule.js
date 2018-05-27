const MAX_TIME = 30; // ms

const rAF = () => new Promise((resolve) => {
  requestAnimationFrame(t => resolve(t));
});

let lastYieldTime = 0;

const shouldYield = () => {
  const timeSinceYield = performance.now() - lastYieldTime;
  return timeSinceYield > MAX_TIME;
};

const yieldIfNecessary = async () => {
  if (shouldYield()) lastYieldTime = await rAF();
};

export { shouldYield, yieldIfNecessary };
