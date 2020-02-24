import OutOfFlow from './OutOfFlow';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';
import { div } from '../dom';
import { Book } from '../book';
import { RuleOptions } from './Rule';
import { PageMaker } from '../types';


// Options:
// selector: String

class FullBleedPage extends OutOfFlow {
  rotate!: string;
  continue!: string;
  
  constructor(options: RuleOptions) {
    options.continue = options.continue ?? 'same';
    options.rotate = options.rotate ?? 'none';
    super(options);
    validateRuntimeOptions(options, {
      name: 'FullBleedPage',
      selector: RuntimeTypes.string,
      continue: RuntimeTypes.enum('next', 'same', 'left', 'right'),
      rotate: RuntimeTypes.enum('none', 'inward', 'outward', 'clockwise', 'counterclockwise'),
    });
  }

  createOutOfFlowPages(elmt: HTMLElement, book: Book, makeNewPage: PageMaker) {
    if (elmt.parentNode) {
      elmt.parentNode.removeChild(elmt);
    }

    let newPage;
    if (book.currentPage.isEmpty) {
      newPage = book.currentPage;
    } else {
      newPage = makeNewPage();
      book.addPage(newPage);
    }
    if (this.rotate !== 'none') {
      const rotateContainer = div(`.rotate-container.page-size-rotated.rotate-${this.rotate}`);
      rotateContainer.appendChild(newPage.background);
      newPage.element.appendChild(rotateContainer);
    }
    newPage.background.appendChild(elmt);
    newPage.hasOutOfFlowContent = true;
  }
}

export default FullBleedPage;
