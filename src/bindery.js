/* global BINDERY_VERSION */

import h from 'hyperscript';

import paginate from './paginate';
import scheduler from './Scheduler';
import PageSetup from './PageSetup';
import Viewer from './Viewer';

import Rules from './Rules/';
import { OptionType, urlQuery, c } from './utils';

import './main.scss';

const { Rule, PageBreak, PageReference, Footnote } = Rules;


const replacer = (element, number) => {
  element.textContent = `${number}`;
  return element;
};


const defaultRules = [
  PageBreak({ selector: '[book-page-break="both"]', position: 'both' }),
  PageBreak({ selector: '[book-page-break="avoid"]', position: 'avoid' }),

  PageBreak({ selector: '[book-page-break="after"][book-page-continue="right"]', position: 'after', continue: 'right' }),
  PageBreak({ selector: '[book-page-break="after"][book-page-continue="left"]', position: 'after', continue: 'left' }),
  PageBreak({ selector: '[book-page-break="after"][book-page-continue="next"]', position: 'after', continue: 'next' }),

  PageBreak({ selector: '[book-page-break="before"][book-page-continue="right"]', position: 'before', continue: 'right' }),
  PageBreak({ selector: '[book-page-break="before"][book-page-continue="left"]', position: 'before', continue: 'left' }),
  PageBreak({ selector: '[book-page-break="before"][book-page-continue="next"]', position: 'before', continue: 'next' }),

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


class Bindery {
  constructor(opts = {}) {
    console.log(`📖 Bindery ${BINDERY_VERSION}`);

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;
    scheduler.isDebugging = opts.debug || urlQuery('debug') || false;

    OptionType.validate(opts, {
      name: 'makeBook',
      autorun: OptionType.bool,
      content: OptionType.any,
      pageSetup: OptionType.shape({
        name: 'pageSetup',
        bleed: OptionType.length,
        margin: OptionType.shape({
          name: 'margin',
          top: OptionType.length,
          inner: OptionType.length,
          outer: OptionType.length,
          bottom: OptionType.length,
        }),
        size: OptionType.shape({
          name: 'size',
          width: OptionType.length,
          height: OptionType.length,
        }),
      }),
      rules: OptionType.array,
    });

    this.pageSetup = new PageSetup(opts.pageSetup);

    this.viewer = new Viewer({ bindery: this });

    if (opts.startingView) {
      this.viewer.setMode(opts.startingView);
    }

    this.rules = defaultRules;
    if (opts.rules) this.addRules(opts.rules);


    if (!opts.content) {
      this.viewer.displayError('Content not specified', 'You must include a source element, selector, or url');
      console.error('Bindery: You must include a source element or selector');
    } else if (typeof opts.content === 'string') {
      this.source = document.querySelector(opts.content);
      if (!(this.source instanceof HTMLElement)) {
        this.viewer.displayError('Content not specified', `Could not find element that matches selector "${opts.content}"`);
        console.error(`Bindery: Could not find element that matches selector "${opts.content}"`);
        return;
      }
      if (this.autorun) {
        this.makeBook();
      }
    } else if (typeof opts.content === 'object' && opts.content.url) {
      const url = opts.content.url;
      const selector = opts.content.selector;
      this.fetchSource(url, selector);
    } else if (opts.content instanceof HTMLElement) {
      this.source = opts.content;
      if (this.autorun) {
        this.makeBook();
      }
    } else {
      console.error('Bindery: Source must be an element or selector');
    }
  }

  // Convenience constructor
  static makeBook(opts = {}) {
    opts.autorun = opts.autorun ? opts.autorun : true;
    return new Bindery(opts);
  }

  fetchSource(url, selector) {
    fetch(url).then((response) => {
      if (response.status === 404) {
        this.viewer.displayError('404', `Could not find file at "${url}"`);
      } else if (response.status === 200) {
        return response.text();
      }
      return '';
    }).then((fetchedContent) => {
      const wrapper = h('div');
      wrapper.innerHTML = fetchedContent;
      this.source = wrapper.querySelector(selector);
      if (!(this.source instanceof HTMLElement)) {
        this.viewer.displayError(
          'Source not specified',
          `Could not find element that matches selector "${selector}"`
        );
        console.error(`Bindery: Could not find element that matches selector "${selector}"`);
        return;
      }
      if (this.autorun) {
        this.makeBook();
      }
    }).catch((error) => {
      console.error(error);
      const scheme = window.location.href.split('://')[0];
      if (scheme === 'file') {
        this.viewer.displayError(
          `Can't fetch content from "${url}"`,
          'Web pages can\'t fetch content unless they are on a server.'
        );
      }
    });
  }

  cancel() {
    this.viewer.cancel();
    document.body.classList.remove(c('viewing'));
    this.source.style.display = '';
  }

  addRules(newRules) {
    newRules.forEach((rule) => {
      if (rule instanceof Rule) {
        this.rules.push(rule);
      } else {
        throw Error(`Bindery: The following is not an instance of Bindery.Rule and will be ignored: ${rule}`);
      }
    });
  }

  updateBookSilent() {
    this.layoutComplete = false;

    this.source.style.display = '';
    const content = this.source.cloneNode(true);
    this.source.style.display = 'none';

    document.body.classList.add(c('viewing'));

    this.pageSetup.updateStylesheet();

    paginate({
      content,
      rules: this.rules,
      success: (book) => {
        this.viewer.book = book;
        this.viewer.render();
        this.layoutComplete = true;
      },
      progress: () => {
      },
      error: (error) => {
        this.layoutComplete = true;
        this.viewer.displayError('Layout failed', error);
      },
    });
  }

  makeBook(doneBinding) {
    if (!this.source) {
      document.body.classList.add(c('viewing'));
      return;
    }

    this.layoutComplete = false;

    if (!this.pageSetup.isSizeValid()) {
      this.viewer.displayError(
        'Page is too small', `Size: ${JSON.stringify(this.pageSize)} \n Margin: ${JSON.stringify(this.pageMargin)} \n Try adjusting the sizes or units.`
      );
      console.error('Bindery: Cancelled pagination. Page is too small.');
      return;
    }

    this.source.style.display = '';
    const content = this.source.cloneNode(true);
    this.source.style.display = 'none';

    // In case we're updating an existing layout
    this.viewer.clear();

    document.body.classList.add(c('viewing'));
    if (scheduler.isDebugging) document.body.classList.add(c('debug'));

    this.pageSetup.updateStylesheet();

    this.viewer.setInProgress();

    paginate(content, this.rules)
      .progress((book) => {
        this.viewer.book = book;
        this.viewer.renderProgress();
      }).then((book) => {
        this.viewer.book = book;
        this.viewer.render();

        this.layoutComplete = true;
        if (doneBinding) doneBinding();
        this.viewer.element.classList.remove(c('in-progress'));
        document.body.classList.remove(c('debug'));
      }).catch((error) => {
        this.layoutComplete = true;
        this.viewer.element.classList.remove(c('in-progress'));
        this.viewer.displayError('Layout couldn\'t complete', error);
      });
  }
}

export default Bindery;
