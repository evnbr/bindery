import Rule from './Rule';
import { validate, T } from '../option-checker';

class Split extends Rule {
  constructor(options) {
    options.toNext = options.toNext || 'split-to-next';
    options.fromPrevious = options.fromPrevious || 'split-from-previous';
    super(options);

    validate(options, {
      name: 'Split',
      selector: T.string,
      toNext: T.string,
      fromPrevious: T.string,
    });
  }
  get customToNextClass() {
    return this.toNext;
  }
  get customFromPreviousClass() {
    return this.fromPrevious;
  }
}

export default Split;
