import Rule from './Rule';
import UserOption from '../UserOption';


class Counter extends Rule {
  constructor(options) {
    super(options);
    this.selector = '*';
    this.counterValue = 0;
    UserOption.validate(options, {
      name: 'Counter',
      replaceEl: UserOption.string,
      resetEl: UserOption.string,
      incrementEl: UserOption.string,
      replace: UserOption.func,
    });
  }
  beforeAdd(el, state) {
    if (el.matches(this.incrementEl)) {
      this.counterValue += 1;
    }
    if (el.matches(this.resetEl)) {
      this.counterValue = 0;
    }
    if (el.matches(this.replaceEl)) {
      // return super.afterAdd(el, state, requestNewPage, overflowCallback);
      return this.createReplacement(state, el);
    }
    return el;
  }
  createReplacement(state, element) {
    return this.replace(element, this.counterValue);
  }
  replace(element, counterValue) {
    element.textContent = counterValue;
    return element;
  }
}

export default Counter;
