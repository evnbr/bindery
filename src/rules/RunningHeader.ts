import { Rule } from './Rule';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';
import { div } from '../dom';
import { Page } from '../book';

export interface RunningHeaderRuleOptions {
  selector: string
  render: (page: Page) => HTMLElement
}
// TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

class RunningHeader extends Rule {
  constructor(options: Partial<RunningHeaderRuleOptions> = {}) {
    super(options);
    validateRuntimeOptions(options, {
      name: 'RunningHeader',
      render: RuntimeTypes.func,
    });
  }
  eachPage(page: Page) {
    if (!page.runningHeader) {
      const elmt = div('.running-header');
      page.element.appendChild(elmt);
      page.runningHeader = elmt;
    }
    page.runningHeader.innerHTML = this.render(page);
  }
  render(page: Page) {
    return `${page.number}`;
  }
}

export default RunningHeader;
