import Rule from './Rule';
import { validate, T } from '../option-checker';

class Split extends Rule {
  constructor(options) {
    super(options);

    validate(options, {
      name: 'Split',
      selector: T.string,
      toNext: T.string,
      fromPrevious: T.string,
    });
  }

  didSplit(original, clone) {
    if (this.toNext) original.classList.add(this.toNext);
    if (this.fromPrevious) clone.classList.add(this.fromPrevious);
  }
}

export default Split;
