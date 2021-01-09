import { Rule, RuleOptions } from './Rule';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';
import { CSSSelector } from '../types';


export interface CounterRuleOptions extends RuleOptions {
  incrementEl: CSSSelector;
  resetEl: CSSSelector;
  replaceEl: CSSSelector;
  replace: (element: HTMLElement) => HTMLElement
}

class Counter extends Rule {
  counterValue: number;
  incrementEl: CSSSelector;
  resetEl: CSSSelector;
  replaceEl: CSSSelector;

  constructor(options: Partial<CounterRuleOptions>) {
    super(options);
    this.selector = '*';
    this.counterValue = 0;

    this.incrementEl = options.incrementEl ?? '';
    this.resetEl = options.resetEl ?? '';
    this.replaceEl = options.replaceEl ?? '';

    validateRuntimeOptions(options, {
      name: 'Counter',
      replaceEl: RuntimeTypes.string,
      resetEl: RuntimeTypes.string,
      incrementEl: RuntimeTypes.string,
      replace: RuntimeTypes.func,
    });
  }
  setup() {
    this.counterValue = 0;
  }
  beforeAdd(el: HTMLElement) {
    if (this.incrementEl.length && el.matches(this.incrementEl)) this.counterValue += 1;
    if (this.resetEl.length && el.matches(this.resetEl)) this.counterValue = 0;
    if (this.replaceEl.length && el.matches(this.replaceEl)) return this.createReplacement(el);
    return el;
  }
  createReplacement(element: HTMLElement) {
    return this.replace(element, this.counterValue);
  }
  replace(element: HTMLElement, counterValue: number) {
    element.textContent = `${counterValue}`;
    return element;
  }
}

export default Counter;
