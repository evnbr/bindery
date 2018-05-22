import Rule from './Rule';
import { OptionType } from '../utils';
import { createEl } from '../dom';

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
      const elmt = createEl('.running-header');
      page.element.appendChild(elmt);
      page.runningHeader = elmt;
    }
    page.runningHeader.innerHTML = this.render(page);
  }
  render(page) {
    return page.number;
  }
}

export default RunningHeader;
