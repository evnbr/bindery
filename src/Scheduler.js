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
    this.queuedFunc = null;
    this.isPaused = false;
    this.useDelay = false;
    this.delayTime = 100;

    this.lastWaitedTime = 0;
  }

  get isDebugging() {
    return this.useDelay;
  }

  set isDebugging(newValue) {
    this.useDelay = newValue;
    if (newValue) {
      window.binderyDebug = {
        pause: this.pause.bind(this),
        resume: this.resume.bind(this),
        resumeFor: this.resumeFor.bind(this),
        step: this.step.bind(this),
        finish: this.finish.bind(this),
      };
      console.log('Bindery: Debug layout with the following: \nbinderyDebug.pause() \nbinderyDebug.resume()\n binderyDebug.resumeFor(n) // pauses after n steps, \nbinderyDebug.step()');
    }
  }

  shouldYield() {
    const timeSinceYield = performance.now() - this.lastWaitedTime;
    return this.isPaused || this.numberOfCalls > MAX_CALLS || timeSinceYield > MAX_TIME;
  }

  async yieldIfNecessary() {
    if (this.shouldYield()) this.lastWaitedTime = await delay1();
  }

  pause() {
    if (this.isPaused) return 'Already paused';
    this.isPaused = true;
    return 'Paused';
  }
  resumeDelay() {
    this.useDelay = true;
    this.resume();
  }
  finish() {
    this.useDelay = false;
    this.resume();
  }
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.queuedFunc) {
        this.queuedFunc();
        this.queuedFunc = null;
      } else {
        return 'Layout complete';
      }
      return 'Resuming';
    }
    return 'Already running';
  }
  step() {
    if (!this.isPaused) {
      return this.pause();
    }
    if (this.queuedFunc) {
      const queued = this.queuedFunc;
      const n = queued.name;
      this.queuedFunc = null;
      queued();
      return n;
    }
    return 'Layout complete';
  }
  resumeFor(n) {
    this.callsSinceResume = 0;
    this.resumeLimit = n;
    return this.resume();
  }
  endResume() {
    console.log(`Paused after ${this.resumeLimit}`);
    this.resumeLimit = Infinity;
    this.callsSinceResume = 0;
    this.pause();
  }
}

export default new Scheduler();
