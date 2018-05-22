import Replace from './Replace';
import { validate, T } from '../option-checker';
import { createEl } from '../dom';

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
// render: function (Page) => HTMLElement

class Footnote extends Replace {
  constructor(options) {
    super(options);
    validate(options, {
      name: 'Footnote',
      selector: T.string,
      replace: T.func,
      render: T.func,
    });
  }
  afterAdd(element, book, continueOnNewPage, makeNewPage, overflowCallback) {
    const number = book.currentPage.footer.children.length + 1;

    const footnote = createEl('.footnote');
    const contents = this.render(element, number);
    if (contents instanceof HTMLElement) footnote.appendChild(contents);
    else footnote.innerHTML = contents;

    book.currentPage.footer.appendChild(footnote);

    return super.afterAdd(element, book, continueOnNewPage, makeNewPage, (overflowEl) => {
      book.currentPage.footer.removeChild(footnote);
      return overflowCallback(overflowEl);
    });
  }
  createReplacement(book, element) {
    const number = book.currentPage.footer.children.length;
    return this.replace(element, number);
  }
  replace(element, number) {
    element.insertAdjacentHTML('beforeEnd', `<sup class="bindery-sup">${number}</sup>`);
    return element;
  }
  render(element, number) {
    return `<sup>${number}</sup> Default footnote (<a href='/bindery/docs/#footnote'>Learn how to change it</a>)`;
  }
}

export default Footnote;
