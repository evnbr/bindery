import { Rule, RuleOptions } from './Rule';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';

export interface SplitRuleOptions extends RuleOptions {
  selector: string;
  toNext: string;
  fromPrevious: string;
  didSplit: (a: HTMLElement, b: HTMLElement) => void;
}

class Split extends Rule {
  toNext?: string;
  fromPrevious?: string;

  constructor(options: Partial<SplitRuleOptions>) {
    super(options);
    this.toNext = options.toNext;
    this.fromPrevious = options.fromPrevious;

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
