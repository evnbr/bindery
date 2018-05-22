import Rule from './Rule';
import { validate, T } from '../option-checker';


class Counter extends Rule {
  constructor(options) {
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
  beforeAdd(el) {
    if (el.matches(this.incrementEl)) {
      this.counterValue += 1;
    }
    if (el.matches(this.resetEl)) {
      this.counterValue = 0;
    }
    if (el.matches(this.replaceEl)) {
      return this.createReplacement(el);
    }
    return el;
  }
  createReplacement(element) {
    return this.replace(element, this.counterValue);
  }
  replace(element, counterValue) {
    element.textContent = counterValue;
    return element;
  }
}

export default Counter;
