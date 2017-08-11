import Rule from './Rule';

class OutOfFlow extends Rule {
  constructor(options) {
    super(options);
    this.name = 'Out of Flow';
  }
  beforeAdd(elmt, state, continueOnNewPage, makeNewPage) {
    const placeholder = document.createElement('span');
    placeholder.style.display = 'none';
    placeholder.textContent = '[Bindery: Element moved out of flow]';

    this.addElementOutOfFlow(elmt, state, makeNewPage);

    return placeholder;
  }

}

export default OutOfFlow;
