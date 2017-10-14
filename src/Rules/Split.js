import Rule from './Rule';
import { OptionType } from '../utils';

class Split extends Rule {
  constructor(options) {
    options.toNext = options.toNext || 'split-to-next';
    options.fromPrevious = options.fromPrevious || 'split-from-previous';
    super(options);

    OptionType.validate(options, {
      name: 'Split',
      selector: OptionType.string,
      toNext: OptionType.string,
      fromPrevious: OptionType.string,
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
