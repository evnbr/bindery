import h from 'hyperscript';

import paginate from './paginate';
import PageSetup from './PageSetup';
import Viewer from './Viewer';
import c from './utils/prefixClass';

import Rules from './Rules/';
import { OptionType, queryVariable } from './utils';

require('./main.scss');

class Bindery {
  constructor(opts = {}) {
    console.log(`📖 Bindery v${'[AIV]{version}[/AIV]'}`);

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;
    this.debug = opts.debug || queryVariable('debug') || false;

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
    this.controls = this.viewer.controls;

    if (opts.startingView) {
      this.viewer.setMode(opts.startingView);
    }

    this.rules = [];
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
      if (rule instanceof Rules.Rule) {
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
        this.controls.setDone();
        this.layoutComplete = true;
      },
      progress: () => {
      },
      error: (error) => {
        this.layoutComplete = true;
        this.viewer.displayError('Layout couldn\'t complete', error);
      },
      isDebugging: this.debug,
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
    this.viewer.element.classList.add(c('in-progress'));
    if (this.debug) document.body.classList.add(c('debug'));

    this.pageSetup.updateStylesheet();

    this.controls.setInProgress();

    paginate({
      content,
      rules: this.rules,
      success: (book) => {
        this.viewer.book = book;
        this.viewer.render();

        this.layoutComplete = true;
        this.controls.setDone();
        if (doneBinding) doneBinding();
        this.viewer.element.classList.remove(c('in-progress'));
        document.body.classList.remove(c('debug'));
      },
      progress: (book) => {
        this.viewer.book = book;
        this.controls.updateProgress(book.pages.length);
        this.viewer.renderProgress();
      },
      error: (error) => {
        this.layoutComplete = true;
        this.viewer.element.classList.remove(c('in-progress'));
        this.viewer.displayError('Layout couldn\'t complete', error);
      },
      isDebugging: this.debug,
    });
  }
}

export default Bindery;
