import h from 'hyperscript';
import BinderyRule from './BinderyRule';

require('./runningHeader.css');

class RunningHeader extends BinderyRule {
  constructor(options) {
    options.name = 'Running Header';
    if (options.beginSection) {
      options.selector = options.beginSection;
    }
    super(options);
    this.customClass = options.customClass;
    this.currentHeaderContent = '';
  }
  afterAdd(elmt, state) {
    state.currentPage.section = elmt.textContent;
  }
  afterBind(page) {
    if (page.section) {
      this.currentHeaderContent = page.section;
    }
    page.section = this.currentHeaderContent;

    const el = h('.bindery-running-header');
    el.innerHTML = this.render(page);
    page.element.appendChild(el);
  }
  render(page) {
    return page.number;
  }
}

export default function (userOptions) {
  return new RunningHeader(userOptions);
}
