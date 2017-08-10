import h from 'hyperscript';
import Rule from './Rule';
import c from '../utils/prefixClass';

// Options:
// selector: String
// render: function (Page) => HTMLElement
// TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

class RunningHeader extends Rule {
  constructor(options) {
    options.name = 'Running Header';
    super(options);
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
