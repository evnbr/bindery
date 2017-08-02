import h from 'hyperscript';
import BinderyRule from './BinderyRule';

class RunningHeader extends BinderyRule {
  constructor(options) {
    options.name = 'Running Header';
    super(options);
  }
  afterBind(page) {
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
