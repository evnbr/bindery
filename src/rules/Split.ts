import { Rule, RuleOptions } from './Rule';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';

interface SplitRuleOptions extends RuleOptions {
  toNext?: string
  fromPrevious?: string
}

class Split extends Rule {
  toNext?: string;
  fromPrevious?: string;

  constructor(options: SplitRuleOptions) {
    super(options);
    this.toNext = options.toNext
    this.fromPrevious = options.fromPrevious

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
