import OutOfFlow from './OutOfFlow';
import RuleOption from './RuleOption';
import c from '../utils/prefixClass';

// Options:
// selector: String

class FullBleedSpread extends OutOfFlow {
  constructor(options) {
    super(options);
    this.name = 'Full Bleed Spread';
    this.validate(options, {
      selector: RuleOption.string,
      continue: RuleOption.enum('new-page', 'same-page'),
    });
  }
  addElementOutOfFlow(elmt, state, makeNewPage) {
    const leftPage = makeNewPage();
    const rightPage = makeNewPage();

    leftPage.background.appendChild(elmt);
    leftPage.element.classList.add(c('spread'));
    leftPage.setPreference('left');
    leftPage.setOutOfFlow(true);

    rightPage.background.appendChild(elmt.cloneNode(true));
    rightPage.element.classList.add(c('spread'));
    rightPage.setPreference('right');
    rightPage.setOutOfFlow(true);

    state.pages.push(leftPage);
    state.pages.push(rightPage);
  }
}

export default FullBleedSpread;
