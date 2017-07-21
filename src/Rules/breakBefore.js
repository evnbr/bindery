import BinderyRule from './BinderyRule';

class BreakBefore extends BinderyRule {
  constructor(options) {
    options.name = 'Break Before';
    super(options);
  }
  beforeAdd(elmt, state, requestNewPage) {
    if (state.currentPage.flowContent.innerText !== '') {
      const newPage = requestNewPage();
      newPage.setPreference('right');
    }
  }
}

export default function (userOptions) {
  return new BreakBefore(userOptions);
}
