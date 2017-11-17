// promise-inspired thenable.
// really just to make callbacks cleaner,
// not guarenteed to be asynchronous.
// (if then and catch aren't registered yet,
// it waits until they are).

class Thenable {
  constructor(func) {
    this.successArgs = [];
    this.errorArgs = [];

    this.successCallback = null;
    this.errorCallback = null;
    this.progressCallback = null;

    this.chainedThenable = null;
    this.chainedSuccessCallback = null;
    this.chainedErrorCallback = null;

    this.isRejected = false;
    this.isResolved = false;

    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);

    if (func) func(this.resolve, this.reject);
  }

  then(func) {
    if (this.chainedThenable) {
      return this.chainedThenable.then(func);
    }

    if (!this.successCallback) {
      this.successCallback = func;
      if (this.isResolved) this.resolve();
      return this;
    } else if (!this.chainedSuccessCallback) {
      this.chainedSuccessCallback = func;
      // console.log('attached chained then');
      return this;
    }
    throw Error('need real chained then');
  }

  progress(func) {
    this.progressCallback = func;
    return this;
  }

  catch(func) {
    if (this.chainedThenable) {
      return this.chainedThenable.catch(func);
    }

    if (!this.errorCallback) {
      this.errorCallback = func;
      if (this.isRejected) this.reject();
      return this;
    } else if (!this.chainedErrorCallback) {
      this.chainedErrorCallback = func;
      // console.log('attached chained error');
      return this;
    }
    throw Error('need real chained catch');
  }

  resolve(...args) {
    this.isResolved = true;
    if (args.length > 0) this.successArgs = args;
    if (this.successCallback !== null) {
      // console.log('applying then');
      let result;
      if (this.successArgs.length > 0) {
        result = this.successCallback(...this.successArgs);
      } else {
        result = this.successCallback();
      }
      if (this.chainedSuccessCallback) {
        if (result && result.then) result.then(this.chainedSuccessCallback);
        else this.chainedSuccessCallback();
      }
    } else {
      // console.log('waiting for then');
    }
  }

  reject(...args) {
    this.isRejected = true;
    if (args.length > 0) this.errorArgs = args;
    if (this.errorCallback !== null) {
      // console.log('applying catch');
      let result;
      if (this.errorArgs.length > 0) {
        result = this.errorCallback(...this.errorArgs);
      } else {
        result = this.errorCallback();
      }
      if (result && result.then) {
        // console.log('isChain');
        this.chainedThenable = result;
      }
      if (this.successCallback) {
        if (result && result.then) {
          // console.log('forwarded unused then');
          result.then(this.successCallback);
        }
      }
      if (this.chainedSuccessCallback) {
        if (result && result.then) {
          // console.log('forwarded chained then');
          result.then(this.chainedSuccessCallback);
        } else this.chainedSuccessCallback();
      }
      if (this.chainedErrorCallback) {
        // console.log('has chained error');
        if (result && result.then) {
          // console.log('forwarded chained error');
          result.catch(this.chainedErrorCallback);
        } else {
          // console.log('called chained error');
          this.chainedErrorCallback();
        }
      }
    } else {
      // console.log('waiting for catch');
    }
  }

  updateProgress(...args) {
    if (this.progressCallback !== null) {
      this.progressCallback(...args);
    }
  }
}

export default Thenable;
