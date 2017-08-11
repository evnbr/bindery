import h from 'hyperscript';
import Rule from './Rule';
import RuleOption from './RuleOption';
import c from '../utils/prefixClass';

// Options:
// selector: String
// render: function (Page) => HTMLElement
// TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

class RunningHeader extends Rule {
  constructor(options = {}) {
    super(options);
    this.name = 'Running Header';
    this.validate(options, {
      render: RuleOption.func,
    });
  }
  afterBind(page) {
    const el = h(c('.running-header'));
    el.innerHTML = this.render(page);
    page.element.appendChild(el);
  }
  render(page) {
    return page.number;
  }
}

export default RunningHeader;
