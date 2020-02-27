import rules from '../rules';

const {
  PageBreak,
  PageReference,
  Footnote,
  FullBleedPage,
  FullBleedSpread,
} = rules;

const replacer = (element: HTMLElement, number: number) => {
  element.textContent = `${number}`;
  return element;
};

export default [
  PageBreak({ selector: '[book-page-break="both"]', position: 'both' }),
  PageBreak({ selector: '[book-page-break="avoid"]', position: 'avoid' }),

  PageBreak({
    selector: '[book-page-break="after"][book-page-continue="right"]',
    position: 'after',
    continue: 'right',
  }),
  PageBreak({
    selector: '[book-page-break="after"][book-page-continue="left"]',
    position: 'after',
    continue: 'left',
  }),
  PageBreak({
    selector: '[book-page-break="after"][book-page-continue="next"]',
    position: 'after',
    continue: 'next',
  }),

  PageBreak({
    selector: '[book-page-break="before"][book-page-continue="right"]',
    position: 'before',
    continue: 'right',
  }),
  PageBreak({
    selector: '[book-page-break="before"][book-page-continue="left"]',
    position: 'before',
    continue: 'left',
  }),
  PageBreak({
    selector: '[book-page-break="before"][book-page-continue="next"]',
    position: 'before',
    continue: 'next',
  }),

  FullBleedPage({ selector: '[book-full-bleed="page"]' }),
  FullBleedSpread({ selector: '[book-full-bleed="spread"]' }),

  Footnote({
    selector: '[book-footnote-text]',
    render: (element: HTMLElement, number: number) => {
      const txt = element.getAttribute('book-footnote-text');
      return `<i>${number}</i>${txt}`;
    },
  }),

  PageReference({
    selector: '[book-pages-with-text]',
    replace: replacer,
    createTest: (element: HTMLElement) => {
      const text = element.getAttribute('book-pages-with-text') ?? '';
      const term = text.toLowerCase().trim();
      return (pageElement: HTMLElement) => {
        const pageText = pageElement.textContent || '';
        return pageText.toLowerCase().includes(term);
      };
    },
  }),

  PageReference({
    selector: '[book-pages-with-selector]',
    replace: replacer,
    createTest: (element: HTMLElement) => {
      const txt = element.getAttribute('book-pages-with-selector') ?? '';
      const selector = txt.trim();
      return (pageElement: HTMLElement) => {
        return pageElement.querySelector(selector);
      };
    },
  }),

  PageReference({
    selector: '[book-pages-with]',
    replace: replacer,
    createTest: (element: HTMLElement) => {
      const text = element.textContent ?? '';
      const term = text.toLowerCase().trim();
      return (pageElement: HTMLElement) => {
        const pageText = pageElement.textContent ?? '';
        return pageText.toLowerCase().includes(term);
      };
    },
  }),
];
