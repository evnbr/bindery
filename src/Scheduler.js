// When there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent stack overflow
// and browser lockup

const MAX_CALLS = 800;
const MAX_TIME = 50; // ms


const delay1 = () => new Promise((resolve) => {
  requestAnimationFrame((t) => {
    resolve(t);
  });
});

class Scheduler {
  constructor() {
    this.numberOfCalls = 0;
    this.resumeLimit = Infinity;
    this.callsSinceResume = 0;
    this.delayTime = 100;

    this.lastWaitedTime = 0;
  }

  shouldYield() {
    const timeSinceYield = performance.now() - this.lastWaitedTime;
    return this.isPaused || this.numberOfCalls > MAX_CALLS || timeSinceYield > MAX_TIME;
  }

  async yieldIfNecessary() {
    if (this.shouldYield()) this.lastWaitedTime = await delay1();
  }
}

export default new Scheduler();
