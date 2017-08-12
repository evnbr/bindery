import OutOfFlow from './OutOfFlow';
import RuleOption from './RuleOption';
import c from '../utils/prefixClass';

// Options:
// selector: String

class FullBleedSpread extends OutOfFlow {
  constructor(options) {
    options.continue = options.continue || 'same';
    super(options);
    this.name = 'Full Bleed Spread';
    this.validate(options, {
      selector: RuleOption.string,
      continue: RuleOption.enum('next', 'same', 'left', 'right'),
    });
  }
  addElementOutOfFlow(elmt, state, makeNewPage) {
    let leftPage;
    if (state.currentPage.isEmpty) {
      leftPage = state.currentPage;
    } else {
      leftPage = makeNewPage();
      state.pages.push(leftPage);
    }

    const rightPage = makeNewPage();
    state.pages.push(rightPage);

    leftPage.background.appendChild(elmt);
    leftPage.element.classList.add(c('spread'));
    leftPage.setPreference('left');
    leftPage.isOutOfFlow = this.continue === 'same';

    rightPage.background.appendChild(elmt.cloneNode(true));
    rightPage.element.classList.add(c('spread'));
    rightPage.setPreference('right');
    rightPage.isOutOfFlow = this.continue === 'same';
  }
}

export default FullBleedSpread;
