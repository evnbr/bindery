import { createEl } from '../dom-utils';
import clonePath from './clonePath';

class FlowBox {
  constructor() {
    this.content = createEl('flow-content');
    this.element = createEl('flow-box', [this.content]);
    this.path = [];
  }

  get currentElement() {
    const len = this.path.length;
    if (len > 0) return this.path[len - 1];
    return this.content;
  }

  get isEmpty() {
    return this.content.textContent.trim() === '' && this.content.offsetHeight < 1;
  }

  get isReasonableSize() {
    const box = this.element.getBoundingClientRect();
    return (box.height > 100) && (box.width > 100); // TODO: Number is arbitrary
  }

  continueFrom(prevFlowBox, applyRules) {
    this.path = clonePath(prevFlowBox.path, applyRules);
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
