import { createEl } from '../dom';
import { last } from '../utils';
import clonePath from './clonePath';

class FlowBox {
  constructor() {
    this.content = createEl('flow-content');
    this.element = createEl('flow-box', [this.content]);
    this.path = [];
  }

  get currentElement() {
    if (this.path.length > 0) return last(this.path);
    return this.content;
  }

  get isEmpty() {
    return this.content.textContent.trim() === '' && this.content.offsetHeight < 1;
  }

  get isReasonable() {
    const box = this.element.getBoundingClientRect();
    return (box.height > 100) && (box.width > 100); // TODO: Number is arbitrary
  }

  continueFrom(prevFlowBox, classes) {
    this.path = clonePath(prevFlowBox.path, classes);
    if (this.path[0]) {
      this.content.appendChild(this.path[0]);
    }
  }

  overflowAmount() {
    const contentH = this.content.offsetHeight;
    const boxH = this.element.offsetHeight;
    if (boxH === 0) throw Error('Bindery: Trying to flow into a box of zero height.');
    return contentH - boxH;
  }

  hasOverflowed() {
    return this.overflowAmount() > -5;
  }
}

export default FlowBox;
