import h from 'hyperscript';
import Rule from './Rule';
import c from '../utils/prefixClass';
import elToStr from '../utils/elementToString';

class OutOfFlow extends Rule {
  constructor(options) {
    super(options);
    this.name = 'Out of Flow';
  }
  beforeAdd(elmt) {
    elmt.setAttribute('data-ignore-overflow', true);
    return elmt;
  }
  afterAdd(elmt, state, continueOnNewPage, makeNewPage) {
    this.createOutOfFlowPages(elmt, state, makeNewPage);

    // Catches cases when we didn't need to create a new page. but unclear
    if (this.continue !== 'same' || state.currentPage.hasOutOfFlowContent) {
      continueOnNewPage();
      if (this.continue === 'left' || this.continue === 'right') {
        state.currentPage.setPreference(this.continue);
      }
    }

    return elmt;
  }
}

export default OutOfFlow;
