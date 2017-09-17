import h from 'hyperscript';
import OutOfFlow from './OutOfFlow';
import { OptionType } from '../utils';
import c from '../utils/prefixClass';

// Options:
// selector: String

class FullBleedPage extends OutOfFlow {
  constructor(options) {
    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';
    super(options);
    this.name = 'Full Bleed Page';
    OptionType.validate(options, {
      selector: OptionType.string,
      continue: OptionType.enum('next', 'same', 'left', 'right'),
      rotate: OptionType.enum('none', 'inward', 'outward', 'clockwise', 'counterclockwise'),
    });
  }

  createOutOfFlowPages(elmt, book, makeNewPage) {
    elmt.parentNode.removeChild(elmt);

    let newPage;
    if (book.pageInProgress.isEmpty) {
      newPage = book.pageInProgress;
    } else {
      newPage = makeNewPage();
      book.pages.push(newPage);
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
