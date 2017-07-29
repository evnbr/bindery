import BinderyRule from './BinderyRule';

require('./spread.css');

class Spread extends BinderyRule {
  constructor(options) {
    options.name = 'Spread';
    super(options);

    this.prevPage = null;
    this.prevElementPath = null;
  }
  beforeAdd(elmt, state, requestNewPage) {
    this.prevPage = state.currentPage;
    this.prevElementPath = state.path;

    requestNewPage();
    return elmt;
  }
  afterAdd(elmt, state, requestNewPage) {
    const leftPage = state.currentPage;
    const dupedContent = leftPage.flowContent.cloneNode(true);
    const rightPage = requestNewPage();
    rightPage.flowBox.innerHTML = '';
    rightPage.flowBox.appendChild(dupedContent);
    rightPage.flowContent = dupedContent;

    leftPage.element.classList.add('bindery-spread');
    leftPage.element.classList.add('bleed');
    leftPage.setPreference('left');
    leftPage.setOutOfFlow(true);

    rightPage.element.classList.add('bindery-spread');
    rightPage.element.classList.add('bleed');
    rightPage.setPreference('right');
    rightPage.setOutOfFlow(true);

    state.currentPage = this.prevPage;
    state.path = this.prevElementPath;

    return elmt;
  }
}

export default function (userOptions) {
  return new Spread(userOptions);
}
