import { pageNumbersForTest } from './searchPages';

const MAXIMUM_PAGE_LIMIT = 2000;

class Book {
  constructor() {
    this.pages = [];
    this.pageRefs = [];
    this.isComplete = false;
    this.estimatedProgress = 0;
  }

  get pageCount() {
    return this.pages.length;
  }

  registerPageReference(test, renderUpdate) {
    this.pageRefs.push({ test, renderUpdate });
  }

  updatePageReferences() {
    // querySelector first, then rerender
    const results = this.pageRefs.map(ref => pageNumbersForTest(this.pages, ref.test));
    this.pageRefs.forEach((ref, i) => ref.renderUpdate(results[i]));
  }

  setCompleted() {
    this.isComplete = true;
    this.estimatedProgress = 1;
    this.updatePageReferences();
  }

  didAddPage() {
    this.validate();
    this.updatePageReferences();
  }

  validate() {
    if (this.pageCount > MAXIMUM_PAGE_LIMIT) {
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }
  }
}

export default Book;
