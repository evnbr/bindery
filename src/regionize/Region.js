import { createEl } from '../dom-utils';

class Region {
  constructor() {
    this.content = createEl('flow-content');
    this.element = createEl('flow-box', [this.content]);
    this.path = [];
  }

  setPath(newPath) {
    this.path = newPath;
    if (newPath.length > 0) this.content.appendChild(newPath[0]);
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

export default Region;
