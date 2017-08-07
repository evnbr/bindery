// Even when there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent the call stack from getting too big.
//
// There might be a better way to do this.
const MAX_CALLS = 500;

class Scheduler {
  constructor({ delay, debuggable }) {
    this.delay = delay;
    this.numberOfCalls = 0;
    this.resumeLimit = Infinity;
    this.callsSinceResume = 0;
    this.queuedFunc = null;
    this.isPaused = false;

    if (debuggable) {
      // Only expose these
      window.binderyDebug = {
        pause: this.pause.bind(this),
        resume: this.resume.bind(this),
        resumeFor: this.resumeFor.bind(this),
        step: this.step.bind(this),
      };
      console.log('Bindery: Debug layout with the following: \nbinderyDebug.pause() \nbinderyDebug.resume()\n binderyDebug.resumeFor(n) // pauses after n steps, \nbinderyDebug.step()');
    }
  }
  throttle(func) {
    this.callsSinceResume += 1;

    if (this.callsSinceResume > this.resumeLimit) {
      console.log(`Paused after ${this.resumeLimit}`);
      this.resumeLimit = Infinity;
      this.callsSinceResume = 0;
      this.pause();
    }

    if (this.isPaused) {
      this.queuedFunc = func;
    } else if (this.delay > 0) {
      setTimeout(func, this.delay);
    } else if (this.numberOfCalls < MAX_CALLS) {
      this.numberOfCalls += 1;
      func();
    } else {
      this.numberOfCalls = 0;
      requestAnimationFrame(func);
    }
  }
  pause() {
    if (this.isPaused) return 'Already paused';
    this.isPaused = true;
    return 'Paused';
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
      this.pause();
    }
    if (this.queuedFunc) {
      this.queuedFunc();
      const n = this.queuedFunc.name;
      this.queuedFunc = null;
      return n;
    }
    return 'Layout complete';
  }
  resumeFor(n) {
    this.callsSinceResume = 0;
    this.resumeLimit = n;
    return this.resume();
  }
}

export default Scheduler;
