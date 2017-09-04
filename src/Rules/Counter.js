import Rule from './Rule';
import RuleOption from './RuleOption';


class Counter extends Rule {
  constructor(options) {
    options.selector = '*';
    super(options);
    this.counterValue = 0;
    this.name = 'Counter';
    RuleOption.validate(options, {
      replaceEl: RuleOption.string,
      resetEl: RuleOption.string,
      incrementEl: RuleOption.string,
      replace: RuleOption.func,
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
