import h from 'hyperscript';
import Rule from './Rule';
import c from '../utils/prefixClass';
import elToStr from '../utils/elementToString';

class OutOfFlow extends Rule {
  constructor(options) {
    super(options);
    this.name = 'Out of Flow';
  }
  beforeAdd(elmt, state, continueOnNewPage, makeNewPage) {
    const placeholder = h(c('.out-of-flow'));
    placeholder.setAttribute('data-bindery', `${elToStr(elmt)}`);
    // placeholder.textContent = '[Bindery: Element moved out of flow]';

    elmt.setAttribute('data-bindery-larger-than-page', true);

    return elmt;
  }
  afterAdd(elmt, state, continueOnNewPage, makeNewPage) {
    this.addElementOutOfFlow(elmt, state, makeNewPage);

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
