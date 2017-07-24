import h from 'hyperscript';
import BinderyRule from './BinderyRule';

require('./runningHeader.css');

class PageNumber extends BinderyRule {
  constructor(options = {}) {
    options.name = 'Page Number';
    super(options);
    this.customClass = options.customClass;
  }
  afterBind(pg, i) {
    pg.number = i + 1;
    const el = h('.bindery-num', `${pg.number}`);
    if (this.customClass) {
      el.classList.add(this.customClass);
    }
    pg.element.appendChild(el);
  }
}

export default function (options) {
  return new PageNumber(options);
}
