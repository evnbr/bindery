import rules from '../rules';

const {
  PageBreak,
  PageReference,
  Footnote,
  FullBleedPage,
  FullBleedSpread,
} = rules;

const replacer = (element, number) => {
  element.textContent = `${number}`;
  return element;
};

export default [
  PageBreak({ selector: '[book-page-break="both"]', position: 'both' }),
  PageBreak({ selector: '[book-page-break="avoid"]', position: 'avoid' }),

  PageBreak({ selector: '[book-page-break="after"][book-page-continue="right"]', position: 'after', continue: 'right' }),
  PageBreak({ selector: '[book-page-break="after"][book-page-continue="left"]', position: 'after', continue: 'left' }),
  PageBreak({ selector: '[book-page-break="after"][book-page-continue="next"]', position: 'after', continue: 'next' }),

  PageBreak({ selector: '[book-page-break="before"][book-page-continue="right"]', position: 'before', continue: 'right' }),
  PageBreak({ selector: '[book-page-break="before"][book-page-continue="left"]', position: 'before', continue: 'left' }),
  PageBreak({ selector: '[book-page-break="before"][book-page-continue="next"]', position: 'before', continue: 'next' }),

  FullBleedPage({ selector: '[book-full-bleed="page"]' }),
  FullBleedSpread({ selector: '[book-full-bleed="spread"]' }),

  Footnote({
    selector: '[book-footnote-text]',
    render: (element, number) => {
      const txt = element.getAttribute('book-footnote-text');
      return `<i>${number}</i>${txt}`;
    },
  }),

  PageReference({
    selector: '[book-pages-with-text]',
    replace: replacer,
    createTest: (element) => {
      const term = element.getAttribute('book-pages-with-text').toLowerCase().trim();
      return (page) => {
        const txt = page.textContent.toLowerCase();
        return txt.includes(term);
      };
    },
  }),

  PageReference({
    selector: '[book-pages-with-selector]',
    replace: replacer,
    createTest: (element) => {
      const sel = element.getAttribute('book-pages-with-selector').trim();
      return page => page.querySelector(sel);
    },
  }),

  PageReference({
    selector: '[book-pages-with]',
    replace: replacer,
    createTest: (element) => {
      const term = element.textContent.toLowerCase().trim();
      return (page) => {
        const txt = page.textContent.toLowerCase();
        return txt.includes(term);
      };
    },
  }),
];
