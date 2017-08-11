import OutOfFlow from './OutOfFlow';
import RuleOption from './RuleOption';
import c from '../utils/prefixClass';

// Options:
// selector: String

class Spread extends OutOfFlow {
  constructor(options) {
    super(options);
    this.name = 'Spread';
    this.validate(options, {
      selector: RuleOption.string,
    });
  }
  addElementOutOfFlow(elmt, state, makeNewPage) {
    const leftPage = makeNewPage();
    const rightPage = makeNewPage();

    leftPage.background.style.background = 'lime';
    leftPage.background.appendChild(elmt);
    leftPage.element.classList.add(c('spread'));
    leftPage.setPreference('left');
    leftPage.setOutOfFlow(true);

    rightPage.background.style.background = 'lime';
    rightPage.background.appendChild(elmt.cloneNode(true));
    rightPage.element.classList.add(c('spread'));
    rightPage.setPreference('right');
    rightPage.setOutOfFlow(true);

    state.pages.push(leftPage);
    state.pages.push(rightPage);
  }
}

export default Spread;
