import Rule from './Rule';
import RuleOption from './RuleOption';

// Options:
// selector: String
// isContinuationClass: String
// hasContinuationClass: String

class Continuation extends Rule {
  constructor(options) {
    options.hasContinuationClass = options.hasContinuationClass || 'my-continues';
    options.isContinuationClass = options.isContinuationClass || 'my-continuation';
    super(options);

    this.name = 'Continuation';
    this.validate(options, {
      selector: RuleOption.string,
      hasContinuationClass: RuleOption.string,
      isContinuationClass: RuleOption.string,
    });
  }
  get customContinuesClass() {
    return this.hasContinuationClass;
  }
  get customContinuationClass() {
    return this.isContinuationClass;
  }
}

export default Continuation;
