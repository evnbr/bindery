// When there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent stack overflow
// and browser lockup

const MAX_TIME = 50; // ms

const rAF = () => new Promise((resolve) => {
  requestAnimationFrame(t => resolve(t));
});

class Scheduler {
  constructor() {
    this.lastYieldTime = 0;
  }

  shouldYield() {
    const timeSinceYield = performance.now() - this.lastYieldTime;
    return timeSinceYield > MAX_TIME;
  }

  async yieldIfNecessary() {
    if (this.shouldYield()) this.lastYieldTime = await rAF();
  }
}

export default new Scheduler();
