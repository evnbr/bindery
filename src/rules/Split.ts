import Rule from './Rule';
import { validate, T } from '../option-checker';

class Split extends Rule {
  toNext: string | null = null;
  fromPrevious: string | null = null;

  constructor(options) {
    super(options);

    validate(options, {
      name: 'Split',
      selector: T.string,
      toNext: T.string,
      fromPrevious: T.string,
      didSplit: T.func,
    });
  }

  didSplit(original: HTMLElement, clone: HTMLElement) {
    if (this.toNext) original.classList.add(this.toNext);
    if (this.fromPrevious) clone.classList.add(this.fromPrevious);
  }
}

export default Split;
