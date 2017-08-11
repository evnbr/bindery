import OutOfFlow from './OutOfFlow';
import RuleOption from './RuleOption';

// Options:
// selector: String

// TODO: Redesign to add entire element in one go, ignoring bleed and any
// internal rules.

class FullPage extends OutOfFlow {
  constructor(options) {
    super(options);
    this.name = 'Full Page';
    this.validate(options, {
      selector: RuleOption.string,
    });
  }

  addElementOutOfFlow(elmt, state, makeNewPage) {
    const outOfFlowPage = makeNewPage();
    outOfFlowPage.background.style.background = 'red';
    outOfFlowPage.background.appendChild(elmt);
    state.pages.push(outOfFlowPage);
  }
}

export default FullPage;
