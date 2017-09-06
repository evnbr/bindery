import Rule from './Rule';
import UserOption from '../UserOption';

// Options:
// selector: String
// isContinuationClass: String
// hasContinuationClass: String

class Split extends Rule {
  constructor(options) {
    options.toNext = options.toNext || 'split-to-next';
    options.fromPrevious = options.fromPrevious || 'split-from-previous';
    super(options);

    this.name = 'Split';
    UserOption.validate(options, {
      selector: UserOption.string,
      toNext: UserOption.string,
      fromPrevious: UserOption.string,
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
