import OutOfFlow from './OutOfFlow';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';
import { prefixer, div } from '../dom';
import { Book } from '../book';
import { RuleOptions } from './Rule';
import { PageMaker } from '../types';

// Options:
// selector: String

class FullBleedSpread extends OutOfFlow {
  rotate!: string;
  continue!: string;

  constructor(options: RuleOptions) {
    options.continue = options.continue ?? 'same';
    options.rotate = options.rotate ?? 'none';
    super(options);
    validateRuntimeOptions(options, {
      name: 'FullBleedSpread',
      selector: RuntimeTypes.string,
      continue: RuntimeTypes.enum('next', 'same', 'left', 'right'),
      rotate: RuntimeTypes.enum('none', 'clockwise', 'counterclockwise'),
    });
  }
  createOutOfFlowPages(elmt: HTMLElement, book: Book, makeNewPage: PageMaker) {
    if (!!elmt.parentNode) {
      elmt.parentNode.removeChild(elmt);
    }

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
      [leftPage, rightPage].forEach(page => {
        const rotateContainer = div(
          `.rotate-container.spread-size-rotated.rotate-spread-${this.rotate}`,
        );
        rotateContainer.append(page.background);
        page.element.append(rotateContainer);
      });
    }

    leftPage.background.append(elmt);
    leftPage.element.classList.add(prefixer('spread'));
    leftPage.setState({
      isOutOfFlow: this.continue === 'same',
      avoidReorder: true,
      hasOutOfFlowContent: true,
      preferredSide: 'left',
    });

    rightPage.background.append(elmt.cloneNode(true));
    rightPage.element.classList.add(prefixer('spread'));
    rightPage.setState({
      isOutOfFlow: this.continue === 'same',
      avoidReorder: true,
      hasOutOfFlowContent: true,
      preferredSide: 'right',
    });
  }
}

export default FullBleedSpread;
