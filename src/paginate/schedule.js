// When there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent stack overflow
// and browser lockup

const MAX_TIME = 50; // ms

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
