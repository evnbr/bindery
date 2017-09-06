import Rule from './Rule';
import RuleOption from './RuleOption';

// Options:
// selector: String
// isContinuationClass: String
// hasContinuationClass: String

class Split extends Rule {
  constructor(options) {
    super(options);

    this.name = 'Split';
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

export default Split;
