import Rule from './Rule';

// Options:
// selector: String
// isContinuationClass: String
// hasContinuationClass: String

class Continuation extends Rule {
  constructor(options) {
    options.name = 'Continuation';
    options.hasContinuationClass = options.hasContinuationClass || 'my-continues';
    options.isContinuationClass = options.isContinuationClass || 'my-continuation';
    super(options);
  }
  get customContinuesClass() {
    return this.hasContinuationClass;
  }
  get customContinuationClass() {
    return this.isContinuationClass;
  }
}

export default Continuation;
