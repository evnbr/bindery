import Replace from './Replace';
import { validate, T } from '../option-checker';
import { createEl } from '../dom-utils';
import { Book, PageMaker } from '../book';


// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
// render: function (Page) => HTMLElement

class Footnote extends Replace {
  constructor(options: {}) {
    super(options);
    validate(options, {
      name: 'Footnote',
      selector: T.string,
      replace: T.func,
      render: T.func,
    });
  }
  afterAdd(element: HTMLElement, book: Book, continueOnNewPage: Function, makeNewPage: PageMaker, overflowCallback: Function) {
    const number = book.currentPage.footer.children.length + 1;

    const footnote = createEl('.footnote');
    const contents = this.render(element, number);
    if (contents instanceof HTMLElement) footnote.appendChild(contents);
    else footnote.innerHTML = contents;

    book.currentPage.footer.appendChild(footnote);

    return super.afterAdd(element, book, continueOnNewPage, makeNewPage, (overflowEl: HTMLElement) => {
      book.currentPage.footer.removeChild(footnote);
      return overflowCallback(overflowEl);
    });
  }
  createReplacement(book: Book, element: HTMLElement) {
    const number = book.currentPage.footer.children.length;
    return this.replace(element, number);
  }
  replace(element: HTMLElement, number: number) {
    element.insertAdjacentHTML('beforeend', `<sup class="bindery-sup">${number}</sup>`);
    return element;
  }
  render(element: HTMLElement, number: number): (string | HTMLElement) {
    return `<sup>${number}</sup> Default footnote (<a href='/bindery/docs/#footnote'>Learn how to change it</a>)`;
  }
}

export default Footnote;
