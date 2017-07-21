import h from 'hyperscript';
import BinderyRule from './BinderyRule';

require('./runningHeader.css');

class RunningHeader extends BinderyRule {
  constructor(options) {
    options.name = 'Running Header';
    super(options);
    this.customClass = options.customClass;
    this.currentHeaderContent = '';
  }
  afterAdd(elmt, state) {
    this.currentHeaderContent = elmt.textContent;
    state.currentPage.runningHeader.textContent = '';
  }
  afterPageCreated(page) {
    const el = h('.bindery-running-header');
    if (this.customClass) {
      el.classList.add(this.customClass);
    }
    page.runningHeader = el;
    page.element.appendChild(el);
    page.runningHeader.textContent = this.currentHeaderContent;
  }
}

export default function (userOptions) {
  return new RunningHeader(userOptions);
}
