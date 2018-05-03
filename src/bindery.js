/* global BINDERY_VERSION */

import paginate from './paginate';
import scheduler from './Scheduler';
import PageSetup from './Page/PageSetup';

import Viewer from './Viewer';
import { Mode, Paper, Layout, Marks } from './Constants';

import Rules from './Rules/';
import defaultRules from './Rules/defaultRules';

import { OptionType, urlQuery, c } from './utils';

import './main.scss';

const parseHTML = (text, selector) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = text;
  return wrapper.querySelector(selector);
};

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
      ControlsComponent: OptionType.any,
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
      view: OptionType.enum(...Object.values(Mode)),
      printSetup: OptionType.shape({
        name: 'printSetup',
        layout: OptionType.enum(...Object.values(Layout)),
        marks: OptionType.enum(...Object.values(Marks)),
        paper: OptionType.enum(...Object.values(Paper)),
      }),
      rules: OptionType.array,
    });

    this.pageSetup = new PageSetup(opts.pageSetup);
    this.pageSetup.setupPaper(opts.printSetup);

    const startLayout = opts.printSetup ? opts.printSetup.layout || Layout.PAGES : Layout.PAGES;
    const startMarks = opts.printSetup ? opts.printSetup.marks || Marks.CROP : Marks.CROP;
    this.viewer = new Viewer({
      bindery: this,
      mode: opts.view || Mode.PREVIEW,
      marks: startMarks,
      layout: startLayout,
      ControlsComponent: opts.ControlsComponent,
    });

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

  async fetchSource(url, selector) {
    const response = await fetch(url);
    if (response.status !== 200) {
      this.viewer.displayError(response.status, `Could not find file at "${url}"`);
      return;
    }
    const fetchedContent = await response.text();
    const sourceNode = parseHTML(fetchedContent, selector);
    if (!(sourceNode instanceof HTMLElement)) {
      this.viewer.displayError(
        'Source not specified',
        `Could not find element that matches selector "${selector}"`
      );
      console.error(`Bindery: Could not find element that matches selector "${selector}"`);
      return;
    }
    this.source = sourceNode;
    if (this.autorun) this.makeBook();
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
        this.layoutComplete = true;
      },
      progress: () => { },
      error: (error) => {
        this.layoutComplete = true;
        this.viewer.displayError('Layout failed', error);
      },
    });
  }

  async makeBook(doneBinding) {
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

    try {
      const book = await paginate(
        content,
        this.rules,
        partialBook => this.viewer.renderProgress(partialBook)
      );
      this.viewer.render(book);
      this.layoutComplete = true;
      if (doneBinding) doneBinding();
      this.viewer.element.classList.remove(c('in-progress'));
      document.body.classList.remove(c('debug'));
    } catch (e) {
      this.layoutComplete = true;
      this.viewer.element.classList.remove(c('in-progress'));
      this.viewer.displayError('Layout couldn\'t complete', e);
    }
  }
}
Bindery.version = BINDERY_VERSION;


export default Bindery;
