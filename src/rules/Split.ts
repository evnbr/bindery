import Rule from './Rule';
import { validateRuntimeOptions, RuntimeTypes } from '../option-checker';

class Split extends Rule {
  toNext: string | null = null;
  fromPrevious: string | null = null;

  constructor(options: {}) {
    super(options);

    validateRuntimeOptions(options, {
      name: 'Split',
      selector: RuntimeTypes.string,
      toNext: RuntimeTypes.string,
      fromPrevious: RuntimeTypes.string,
      didSplit: RuntimeTypes.func,
    });
  }

  didSplit(original: HTMLElement, clone: HTMLElement) {
    if (this.toNext) original.classList.add(this.toNext);
    if (this.fromPrevious) clone.classList.add(this.fromPrevious);
  }
}

export default Split;
