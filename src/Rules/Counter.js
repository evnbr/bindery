import Rule from './Rule';
import { OptionType } from '../utils';


class Counter extends Rule {
  constructor(options) {
    super(options);
    this.selector = '*';
    this.counterValue = 0;
    OptionType.validate(options, {
      name: 'Counter',
      replaceEl: OptionType.string,
      resetEl: OptionType.string,
      incrementEl: OptionType.string,
      replace: OptionType.func,
    });
  }
  layoutStart() {
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
