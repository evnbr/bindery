import h from 'hyperscript';
import OutOfFlow from './OutOfFlow';
import { OptionType, c } from '../utils';

// Options:
// selector: String

class FullBleedSpread extends OutOfFlow {
  constructor(options) {
    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';
    super(options);
    OptionType.validate(options, {
      name: 'FullBleedSpread',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'same', 'left', 'right'),
      rotate: OptionType.enum('none', 'clockwise', 'counterclockwise'),
    });
  }
  createOutOfFlowPages(elmt, book, makeNewPage) {
    elmt.parentNode.removeChild(elmt);

    let leftPage;
    if (book.pageInProgress.isEmpty) {
      leftPage = book.pageInProgress;
    } else {
      leftPage = makeNewPage();
      book.pages.push(leftPage);
    }

    const rightPage = makeNewPage();
    book.pages.push(rightPage);

    if (this.rotate !== 'none') {
      [leftPage, rightPage].forEach((page) => {
        const rotateContainer = h(c('.rotate-container'));
        rotateContainer.classList.add(c('spread-size-rotated'));
        rotateContainer.classList.add(c(`rotate-spread-${this.rotate}`));
        rotateContainer.appendChild(page.background);
        page.element.appendChild(rotateContainer);
      });
    }

    leftPage.background.appendChild(elmt);
    leftPage.element.classList.add(c('spread'));
    leftPage.setPreference('left');
    leftPage.isOutOfFlow = this.continue === 'same';
    leftPage.hasOutOfFlowContent = true;

    rightPage.background.appendChild(elmt.cloneNode(true));
    rightPage.element.classList.add(c('spread'));
    rightPage.setPreference('right');
    rightPage.isOutOfFlow = this.continue === 'same';
    rightPage.hasOutOfFlowContent = true;
  }
}

export default FullBleedSpread;
