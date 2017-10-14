import h from 'hyperscript';
import Rule from './Rule';
import { OptionType } from '../utils';
import c from '../utils/prefixClass';

// Options:
// selector: String
// render: function (Page) => HTMLElement
// TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

class RunningHeader extends Rule {
  constructor(options = {}) {
    super(options);
    OptionType.validate(options, {
      name: 'RunningHeader',
      render: OptionType.func,
    });
  }
  eachPage(page) {
    if (!page.runningHeader) {
      const el = h(c('.running-header'));
      page.element.appendChild(el);
      page.runningHeader = el;
    }
    page.runningHeader.innerHTML = this.render(page);
  }
  render(page) {
    return page.number;
  }
}

export default RunningHeader;
