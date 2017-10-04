import h from 'hyperscript';
import Replace from './Replace';
import { OptionType } from '../utils';

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
// render: function (Page) => HTMLElement

class Footnote extends Replace {
  constructor(options) {
    super(options);
    this.name = 'Footnote';
    OptionType.validate(options, {
      selector: OptionType.string,
      replace: OptionType.func,
      render: OptionType.func,
    });
  }
  afterAdd(element, book, continueOnNewPage, makeNewPage, overflowCallback) {
    const number = book.pageInProgress.footer.children.length + 1;

    const footnote = h('.footnote');
    const contents = this.render(element, number);
    if (contents instanceof HTMLElement) footnote.appendChild(contents);
    else footnote.innerHTML = contents;

    book.pageInProgress.footer.appendChild(footnote);

    return super.afterAdd(element, book, continueOnNewPage, makeNewPage, (overflowEl) => {
      book.pageInProgress.footer.removeChild(footnote);
      return overflowCallback(overflowEl);
    });
  }
  createReplacement(book, element) {
    const number = book.pageInProgress.footer.children.length;
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
