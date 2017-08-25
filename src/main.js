import paginate from './paginate';

import Styler from './Styler';
import Viewer from './Viewer';
import c from './utils/prefixClass';
import { arraysEqual } from './utils';

import Rules from './Rules/';

require('./_style/main.scss');

const DEFAULT_BLEED = '12pt';
const DEFAULT_PAGE_SIZE = { width: '288pt', height: '432pt' };
const DEFAULT_PAGE_MARGIN = {
  inner: '24pt',
  outer: '32pt',
  bottom: '54pt',
  top: '48pt',
};

class Bindery {
  constructor(opts) {
    console.log(`Bindery ${'[AIV]{version}[/AIV]'}`);

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;
    this.debug = opts.debug || false;

    this.styler = new Styler();
    this.styler.setSize(opts.pageSize || DEFAULT_PAGE_SIZE);
    this.styler.setMargin(opts.pageMargin || DEFAULT_PAGE_MARGIN);
    this.styler.setBleed(opts.bleed || DEFAULT_BLEED);


    this.viewer = new Viewer({ bindery: this });
    this.controls = this.viewer.controls;

    if (opts.startingView) {
      this.viewer.setMode(opts.startingView);
    }

    this.rules = [];
    if (opts.rules) this.addRules(opts.rules);


    if (!opts.source) {
      this.viewer.displayError('Source not specified', 'You must include a source element, selector, or url');
      console.error('Bindery: You must include a source element or selector');
    } else if (typeof opts.source === 'string') {
      this.source = document.querySelector(opts.source);
      if (!(this.source instanceof HTMLElement)) {
        this.viewer.displayError('Source not specified', `Could not find element that matches selector "${opts.source}"`);
        console.error(`Bindery: Could not find element that matches selector "${opts.source}"`);
        return;
      }
      if (this.autorun) {
        this.makeBook();
      }
    } else if (typeof opts.source === 'object' && opts.source.url) {
      const url = opts.source.url;
      const selector = opts.source.selector;
      this.fetchSource(url, selector);
    } else if (opts.source instanceof HTMLElement) {
      this.source = opts.source;
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
      const wrapper = document.createElement('div');
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
    this.stopCheckingLayout();
    this.viewer.cancel();
    document.body.classList.remove(c('viewing'));
    this.source.style.display = '';
  }

  addRules(newRules) {
    newRules.forEach((rule) => {
      if (rule instanceof Rules.Rule) {
        this.rules.push(rule);
      } else {
        throw Error(`Bindery: The following is not an instance of Bindery.Rule and will be ignored: ${rule}`);
      }
    });
  }

  makeBook(doneBinding) {
    if (!this.source) {
      document.body.classList.add(c('viewing'));
      return;
    }

    if (!this.styler.isSizeValid()) {
      this.viewer.displayError(
        'Page is too small', `Size: ${JSON.stringify(this.pageSize)} \n Margin: ${JSON.stringify(this.pageMargin)} \n Try adjusting the sizes or units.`
      );
      console.error('Bindery: Cancelled pagination. Page is too small.');
      return;
    }

    this.stopCheckingLayout();

    this.source.style.display = '';
    const content = this.source.cloneNode(true);
    this.source.style.display = 'none';

    // In case we're updating an existing layout
    this.viewer.clear();
    document.body.classList.add(c('viewing'));
    this.viewer.element.classList.add(c('in-progress'));
    if (this.debug) document.body.classList.add(c('debug'));

    this.styler.updateStylesheet();

    this.controls.setInProgress();

    paginate({
      content,
      rules: this.rules,
      success: (book) => {
        setTimeout(() => {
          this.viewer.book = book;
          this.viewer.render();

          this.controls.setDone();
          if (doneBinding) doneBinding();
          this.viewer.element.classList.remove(c('in-progress'));
          document.body.classList.remove(c('debug'));
          this.startCheckingLayout();
        }, 100);
      },
      progress: (pageCount) => {
        this.controls.updateProgress(pageCount);
      },
      error: (error) => {
        document.body.classList.remove(c('in-progress'));
        this.viewer.displayError('Layout couldn\'t complete', error);
      },
      isDebugging: this.debug,
    });
  }

  startCheckingLayout() {
    if (this.autoupdate) {
      this.layoutChecker = setInterval(() => {
        this.checkLayoutChange();
      }, 500);
    }
  }

  stopCheckingLayout() {
    if (this.layoutChecker) {
      clearInterval(this.layoutChecker);
      this.pageOverflows = null;
    }
  }

  checkLayoutChange() {
    if (this.viewer.mode !== 'grid') return;
    if (!this.pageOverflows) {
      this.pageOverflows = this.getPageOverflows();
      return;
    }

    const newOverflows = this.getPageOverflows();
    if (!arraysEqual(newOverflows, this.pageOverflows)) {
      this.throttledUpdateBook();
      this.pageOverflows = newOverflows;
    }
  }

  throttledUpdateBook() {
    if (this.makeBookTimer) clearTimeout(this.makeBookTimer);
    this.makeBookTimer = setTimeout(() => {
      this.makeBook();
    }, 500);
  }

  getPageOverflows() {
    return this.viewer.pages.map(page => page.overflowAmount());
  }

}


Object.keys(Rules).forEach((rule) => {
  Bindery[rule] = Rules[rule];
});

module.exports = Bindery;
