import h from 'hyperscript';
import OutOfFlow from './OutOfFlow';
import RuleOption from './RuleOption';
import c from '../utils/prefixClass';

// Options:
// selector: String

class FullBleedPage extends OutOfFlow {
  constructor(options) {
    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';
    super(options);
    this.name = 'Full Bleed Page';
    this.validate(options, {
      selector: RuleOption.string,
      continue: RuleOption.enum('next', 'same', 'left', 'right'),
      rotate: RuleOption.enum('none', 'inward', 'outward', 'clockwise', 'counterclockwise'),
    });
  }

  addElementOutOfFlow(elmt, state, makeNewPage) {
    let newPage;
    if (state.currentPage.isEmpty) {
      newPage = state.currentPage;
    } else {
      newPage = makeNewPage();
      state.pages.push(newPage);
    }
    if (this.rotate !== 'none') {
      const rotateContainer = h(c('.rotate-container'));
      rotateContainer.classList.add(c('page-size-rotated'));
      rotateContainer.classList.add(c(`rotate-${this.rotate}`));
      rotateContainer.appendChild(newPage.background);
      newPage.element.appendChild(rotateContainer);
    }
    newPage.background.appendChild(elmt);
    newPage.hasOutOfFlowContent = true;
  }
}

export default FullBleedPage;
