import Rule from './Rule';

// Options:
// position: String ( 'before' (default) | 'after' | 'both' | 'avoid' )
// continue: String ( 'any' (default) | 'left' | 'right' )

class PageBreak extends Rule {
  constructor(options) {
    options.name = 'Page Break';
    options.position = options.position ? options.position : 'before';
    options.continue = options.continue ? options.continue : 'any';
    super(options);
  }
  get avoidSplit() {
    return this.position === 'avoid';
  }
  beforeAdd(elmt, state, requestNewPage) {
    if (this.position === 'before' || this.position === 'both') {
      if (!state.currentPage.isEmpty) {
        requestNewPage();
      }
      if (this.continue !== 'any') {
        state.currentPage.setPreference(this.continue);
      }
    }
    return elmt;
  }
  afterAdd(elmt, state, requestNewPage) {
    if (this.position === 'after' || this.position === 'both') {
      const newPage = requestNewPage();
      if (this.continue !== 'any') {
        newPage.setPreference(this.continue);
      }
    }
    return elmt;
  }
}

export default PageBreak;
