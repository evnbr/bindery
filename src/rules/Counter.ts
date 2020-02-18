import Rule, { RuleOptions } from './Rule';
import { validate, T } from '../option-checker';


class Counter extends Rule {
  counterValue: number;
  incrementEl: string = '';
  resetEl: string = '';
  replaceEl: string = '';

  constructor(options: RuleOptions) {
    super(options);
    this.selector = '*';
    this.counterValue = 0;

    validate(options, {
      name: 'Counter',
      replaceEl: T.string,
      resetEl: T.string,
      incrementEl: T.string,
      replace: T.func,
    });
  }
  setup() {
    this.counterValue = 0;
  }
  beforeAdd(el: HTMLElement) {
    if (el.matches(this.incrementEl)) this.counterValue += 1;
    if (el.matches(this.resetEl)) this.counterValue = 0;
    if (el.matches(this.replaceEl)) return this.createReplacement(el);
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
