import Replace from './Replace';
import { validate, T } from '../option-checker';
import { createEl } from '../dom-utils';

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
    if (!book.currentPage.footnoteElements) {
      book.currentPage.footnoteElements = [];
    }

    const number = book.currentPage.footnoteElements.length + 1;

    const footnoteEl = createEl('.footnote');
    const contents = this.render(element, number);
    if (contents instanceof HTMLElement) footnoteEl.append(contents);
    else footnoteEl.innerHTML = contents;

    // book.currentPage.footer.appendChild(footnote);
    book.currentPage.footnoteElements.push(footnoteEl);

    return super.afterAdd(element, book, continueOnNewPage, makeNewPage, (overflowEl) => {
      book.currentPage.footnoteElements = book.currentPage.footnoteElements.filter((el) => el !== footnoteEl);
      return overflowCallback(overflowEl);
    });
  }

  createReplacement(book, element) {
    const number = book.currentPage.footnoteElements.length;
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
