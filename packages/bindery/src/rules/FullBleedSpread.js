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
        page.rotation = this.rotate;
      });
    }

    leftPage.backgroundContent = elmt;
    leftPage.isSpread = true;
    leftPage.setPreference('left');
    leftPage.isOutOfFlow = this.continue === 'same';
    leftPage.avoidReorder = true;
    leftPage.hasOutOfFlowContent = true;

    rightPage.backgroundContent = elmt.cloneNode(true);
    rightPage.isSpread = true;
    rightPage.setPreference('right');
    rightPage.isOutOfFlow = this.continue === 'same';
    rightPage.avoidReorder = true;
    rightPage.hasOutOfFlowContent = true;
  }
}

export default FullBleedSpread;
