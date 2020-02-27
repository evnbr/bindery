import Replace from './Replace';
import { validateRuntimeOptions, RuntimeTypes } from '../runtimeOptionChecker';
import { div } from '../dom';
import { Book } from '../book';
import { RuleOptions } from './Rule';
import { PageMaker } from '../types';

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
// render: function (Page) => HTMLElement

class Footnote extends Replace {
  constructor(options: RuleOptions) {
    super(options);
    validateRuntimeOptions(options, {
      name: 'Footnote',
      selector: RuntimeTypes.string,
      replace: RuntimeTypes.func,
      render: RuntimeTypes.func
    });
  }
  afterAdd(
    element: HTMLElement,
    book: Book,
    continueOnNewPage: Function,
    makeNewPage: PageMaker,
    overflowCallback: Function
  ) {
    const number = book.currentPage.footer.children.length + 1;

    const footnote = div('.footnote');
    const contents = this.render(element, number);
    if (contents instanceof HTMLElement) footnote.appendChild(contents);
    else footnote.innerHTML = contents;

    book.currentPage.footer.appendChild(footnote);

    return super.afterAdd(
      element,
      book,
      continueOnNewPage,
      makeNewPage,
      (overflowEl: HTMLElement) => {
        book.currentPage.footer.removeChild(footnote);
        return overflowCallback(overflowEl);
      }
    );
  }
  createReplacement(book: Book, element: HTMLElement) {
    const number = book.currentPage.footer.children.length;
    return this.replace(element, number);
  }
  replace(element: HTMLElement, number: number) {
    element.insertAdjacentHTML(
      'beforeend',
      `<sup class="bindery-sup">${number}</sup>`
    );
    return element;
  }
  render(element: HTMLElement, number: number): string | HTMLElement {
    return `<sup>${number}</sup> Default footnote (<a href='/bindery/docs/#footnote'>Learn how to change it</a>)`;
  }
}

export default Footnote;
