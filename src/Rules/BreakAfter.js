import BinderyRule from './BinderyRule';

class BreakAfter extends BinderyRule {
  constructor(options) {
    options.name = 'Break Before';
    super(options);
  }
  afterAdd(elmt, state, requestNewPage) {
    if (state.currentPage.flowContent.innerText !== '') {
      const newPage = requestNewPage();
      newPage.setPreference('right');
    }
  }
}

export default function (userOptions) {
  return new BreakAfter(userOptions);
}
