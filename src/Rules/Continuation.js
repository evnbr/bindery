import Rule from './Rule';

// API:
// position: 'before' (default) | 'after' | 'both' | 'avoid'
// continue: | 'any' (default) | 'left' | 'right'

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
