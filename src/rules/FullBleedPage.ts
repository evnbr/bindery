import OutOfFlow from './OutOfFlow';
import { validate, T } from '../option-checker';
import { createEl } from '../dom-utils';

// Options:
// selector: String

class FullBleedPage extends OutOfFlow {
  rotate!: string;
  
  constructor(options) {
    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';
    super(options);
    validate(options, {
      name: 'FullBleedPage',
      selector: T.string,
      continue: T.enum('next', 'same', 'left', 'right'),
      rotate: T.enum('none', 'inward', 'outward', 'clockwise', 'counterclockwise'),
    });
  }

  createOutOfFlowPages(elmt, book, makeNewPage) {
    elmt.parentNode.removeChild(elmt);

    let newPage;
    if (book.currentPage.isEmpty) {
      newPage = book.currentPage;
    } else {
      newPage = makeNewPage();
      book.addPage(newPage);
    }
    if (this.rotate !== 'none') {
      const rotateContainer = createEl(`.rotate-container.page-size-rotated.rotate-${this.rotate}`);
      rotateContainer.appendChild(newPage.background);
      newPage.element.appendChild(rotateContainer);
    }
    newPage.background.appendChild(elmt);
    newPage.hasOutOfFlowContent = true;
  }
}

export default FullBleedPage;
