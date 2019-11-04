import OutOfFlow from './OutOfFlow';
import { validate, T } from '../option-checker';

// Options:
// selector: String

class FullBleedSpread extends OutOfFlow {
  constructor(options) {
    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';
    super(options);
    validate(options, {
      name: 'FullBleedSpread',
      selector: T.string,
      continue: T.enum('next', 'same', 'left', 'right'),
      rotate: T.enum('none', 'clockwise', 'counterclockwise'),
    });
  }

  createOutOfFlowPages(elmt, book, makeNewPage) {
    elmt.parentNode.removeChild(elmt);

    let leftPage;
    if (book.currentPage.isEmpty) {
      leftPage = book.currentPage;
    } else {
      leftPage = makeNewPage();
      book.addPage(leftPage);
    }

    const rightPage = makeNewPage();
    book.addPage(rightPage);

    if (this.rotate !== 'none') {
      [leftPage, rightPage].forEach((page) => {
        page.setState({ rotation: this.rotate });
      });
    }
    
    leftPage.setState({
      backgroundContent: elmt,
      hasOutOfFlowContent: true,
      isOutOfFlow: this.continue === 'same',
      isSpread: true,
      avoidReorder: true,
    });
    leftPage.setPreference('left');

    rightPage.setState({
      backgroundContent: elmt.cloneNode(true),
      hasOutOfFlowContent: true,
      isOutOfFlow: this.continue === 'same',
      isSpread: true,
      avoidReorder: true,
    });

    rightPage.setPreference('right');
  }
}

export default FullBleedSpread;
