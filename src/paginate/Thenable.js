// promise-inspired thenable.
// really just to make callbacks cleaner,
// not guarenteed to be asynchronous.
// (if then and catch aren't registered yet,
// it waits until they are).

class Thenable {
  constructor() {
    this.successArgs = [];
    this.errorArgs = [];

    this.successCallback = null;
    this.errorCallback = null;
    this.progressCallback = null;

    this.isRejected = false;
    this.isResolved = false;

    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
  }

  then(func) {
    this.successCallback = func;
    if (this.isResolved) {
      if (this.successArgs.length > 0) {
        this.successCallback(...this.successArgs);
      } else {
        this.successCallback();
      }
    }
    return this;
  }

  progress(func) {
    this.progressCallback = func;
    return this;
  }

  catch(func) {
    this.errorCallback = func;
    if (this.isRejected) {
      if (this.errorCallback !== null) {
        if (this.errorArgs.length > 0) {
          this.errorCallback(...this.errorArgs);
        } else {
          this.errorCallback();
        }
      }
    }
    return this;
  }

  resolve(...args) {
    this.isResolved = true;
    if (args.length > 0) this.successArgs = args;
    if (this.successCallback !== null) {
      if (this.successArgs.length > 0) {
        this.successCallback(...this.successArgs);
      } else {
        this.successCallback();
      }
    }
  }

  reject(...args) {
    this.isRejected = true;
    if (args.length > 0) this.errorArgs = args;
    if (this.errorCallback !== null) {
      if (this.errorArgs.length > 0) {
        this.errorCallback(...this.errorArgs);
      } else {
        this.errorCallback();
      }
    }
  }

  updateProgress(...args) {
    if (this.progressCallback !== null) {
      this.progressCallback(...args);
    }
  }
}

export default Thenable;
