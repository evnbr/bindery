import OutOfFlow from './OutOfFlow';
import RuleOption from './RuleOption';

// Options:
// selector: String

// TODO: Redesign to add entire element in one go, ignoring bleed and any
// internal rules.

class FullBleedPage extends OutOfFlow {
  constructor(options) {
    options.continue = options.continue || 'same';
    super(options);
    this.name = 'Full Bleed Page';
    this.validate(options, {
      selector: RuleOption.string,
      continue: RuleOption.enum('next', 'same', 'left', 'right'),
    });
  }

  addElementOutOfFlow(elmt, state, makeNewPage) {
    if (state.currentPage.isEmpty) {
      state.currentPage.background.appendChild(elmt);
      state.currentPage.hasOutOfFlowContent = true;
    } else {
      const outOfFlowPage = makeNewPage();
      outOfFlowPage.background.appendChild(elmt);
      state.pages.push(outOfFlowPage);
      outOfFlowPage.hasOutOfFlowContent = true;
    }
  }
}

export default FullBleedPage;
