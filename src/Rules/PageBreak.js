import Rule from './Rule';
import RuleOption from './RuleOption';

class PageBreak extends Rule {
  constructor(options) {
    options.position = options.position || 'before';
    options.continue = options.continue || 'any';
    super(options);

    this.name = 'Page Break';
    this.validate(options, {
      selector: RuleOption.string,
      continue: RuleOption.enum('any', 'left', 'right'),
      position: RuleOption.enum('before', 'after', 'both', 'avoid'),
    });
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
