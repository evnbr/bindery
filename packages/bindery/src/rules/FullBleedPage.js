import OutOfFlow from './OutOfFlow';
import { validate, T } from '../option-checker';

// Options:
// selector: String

class FullBleedPage extends OutOfFlow {
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
    newPage.setState({
      rotation: this.rotate,
      backgroundContent: elmt,
      hasOutOfFlowContent: true,
    });
  }
}

export default FullBleedPage;
