import Rule from './Rule';
import RuleOption from './RuleOption';

// Options:
// selector: String
// isContinuationClass: String
// hasContinuationClass: String

class Continuation extends Rule {
  constructor(options) {
    options.toNext = options.hasContinuationClass || 'my-continues';
    options.fromPrevious = options.isContinuationClass || 'my-continuation';
    super(options);

    this.name = 'Continuation';
    RuleOption.validate(options, {
      selector: RuleOption.string,
      toNext: RuleOption.string,
      fromPrevious: RuleOption.string,
    });
  }
  get customContinuesClass() {
    return this.toNext;
  }
  get customContinuationClass() {
    return this.fromPrevious;
  }
}

export default Continuation;
