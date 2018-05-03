import { c, createEl } from '../utils';

class Page {
  constructor() {
    this.flowContent = createEl('content');
    this.flowBox = createEl('flowbox', [this.flowContent]);
    this.footer = createEl('footer');
    this.background = createEl('background');
    this.element = createEl('page', [this.background, this.flowBox, this.footer]);
  }
  overflowAmount() {
    const contentH = this.flowContent.offsetHeight;
    const boxH = this.flowBox.offsetHeight;

    if (boxH === 0) {
      throw Error('Bindery: Trying to flow into a box of zero height.');
    }

    return contentH - boxH;
  }
  hasOverflowed() {
    return this.overflowAmount() > -5;
  }

  static isSizeValid() {
    document.body.classList.remove(c('viewing'));

    const testPage = new Page();
    let measureArea = document.querySelector(c('.measure-area'));
    if (!measureArea) measureArea = document.body.appendChild(createEl('measure-area'));

    measureArea.innerHTML = '';
    measureArea.appendChild(testPage.element);
    const box = testPage.flowBox.getBoundingClientRect();

    measureArea.parentNode.removeChild(measureArea);

    return (box.height > 100) && (box.width > 100); // TODO: Number is arbitrary
  }

  setLeftRight(dir) {
    if (dir === 'left') {
      this.side = dir;
      this.element.classList.remove(c('right'));
      this.element.classList.add(c('left'));
    } else if (dir === 'right') {
      this.side = dir;
      this.element.classList.remove(c('left'));
      this.element.classList.add(c('right'));
    } else {
      throw Error(`Bindery: Setting page to invalid direction${dir}`);
    }
  }

  get suppressErrors() {
    return this.suppress || false;
  }

  set suppressErrors(newVal) {
    this.suppress = newVal;
    if (newVal) {
      this.element.classList.add(c('is-overflowing'));
    } else {
      this.element.classList.remove(c('is-overflowing'));
    }
  }

  get isEmpty() {
    return (
      !this.hasOutOfFlowContent
      && this.flowContent.textContent.trim() === ''
      && this.flowContent.offsetHeight < 1
    );
  }

  get isLeft() {
    return this.side === 'left';
  }

  get isRight() {
    return this.side === 'right';
  }

  setPreference(dir) {
    if (dir === 'left') this.alwaysLeft = true;
    if (dir === 'right') this.alwaysRight = true;
  }
}

export default Page;
