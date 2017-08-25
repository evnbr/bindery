// Even when there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent the call stack from getting too big.
//
// There might be a better way to do this.
const MAX_CALLS = 1000;

class Scheduler {
  constructor(debuggable) {
    this.numberOfCalls = 0;
    this.resumeLimit = Infinity;
    this.callsSinceResume = 0;
    this.queuedFunc = null;
    this.isPaused = false;
    this.useDelay = debuggable;
    this.delayTime = 100;

    if (debuggable) {
      // Only expose these
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
  throttle(func) {
    this.callsSinceResume += 1;

    if (this.callsSinceResume > this.resumeLimit) {
      this.endResume();
    }

    if (this.isPaused) {
      this.queuedFunc = func;
    } else if (this.useDelay) {
      setTimeout(func, this.delayTime);
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

export default Scheduler;
