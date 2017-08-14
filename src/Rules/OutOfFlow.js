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

    this.addElementOutOfFlow(elmt, state, makeNewPage);

    if (this.continue !== 'same') {
      continueOnNewPage();
      if (this.continue === 'left' || this.continue === 'right') {
        state.currentPage.setPreference(this.continue);
      }
    }

    return placeholder;
  }

}

export default OutOfFlow;
