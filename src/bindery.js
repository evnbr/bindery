/* global BINDERY_VERSION */

import paginate from './paginate';
import PageSetup from './Page/PageSetup';

import Viewer from './Viewer';
import { Mode, Paper, Layout, Marks } from './Constants';

import Rules from './Rules/';
import defaultRules from './Rules/defaultRules';

import { OptionType, c } from './utils';

import './main.scss';

const parseHTML = (text, selector) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = text;
  return wrapper.querySelector(selector);
};

const T = OptionType;

class Bindery {
  constructor(opts = {}) {
    console.log(`📖 Bindery ${BINDERY_VERSION}`);

    if (!opts.content) {
      this.viewer.displayError('Content not specified', 'You must include a source element, selector, or url');
      console.error('Bindery: You must include a source element or selector');
      return;
    }

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;

    T.validate(opts, {
      name: 'makeBook',
      autorun: T.bool,
      content: T.any,
      ControlsComponent: T.any,
      pageSetup: T.shape({ name: 'pageSetup', bleed: T.length, margin: T.margin, size: T.size }),
      view: T.enum(...Object.values(Mode)),
      printSetup: T.shape({
        name: 'printSetup',
        layout: T.enum(...Object.values(Layout)),
        marks: T.enum(...Object.values(Marks)),
        paper: T.enum(...Object.values(Paper)),
      }),
      rules: T.array,
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

    this.getSource(opts.content).then((src) => {
      this.source = src;
      if (src && this.autorun) this.makeBook();
    });
  }

  // Convenience constructor
  static makeBook(opts = {}) {
    opts.autorun = opts.autorun ? opts.autorun : true;
    return new Bindery(opts);
  }

  async getSource(content) {
    if (content instanceof HTMLElement) return content;
    if (typeof content === 'string') {
      const el = document.querySelector(content);
      if (!(el instanceof HTMLElement)) {
        this.viewer.displayError('Content not specified', `Could not find element that matches selector "${content}"`);
        console.error(`Bindery: Could not find element that matches selector "${content}"`);
      }
      return el;
    }
    if (typeof content === 'object' && content.url) {
      const url = content.url;
      const selector = content.selector;
      return this.fetchRemoteSource(url, selector);
    }
    throw Error('Bindery: Source must be an element or selector');
  }

  async fetchRemoteSource(url, selector) {
    const response = await fetch(url);
    if (response.status !== 200) {
      this.viewer.displayError(response.status, `Could not find file at "${url}"`);
      return null;
    }
    const fetchedContent = await response.text();
    const sourceNode = parseHTML(fetchedContent, selector);
    if (!(sourceNode instanceof HTMLElement)) {
      this.viewer.displayError(
        'Source not specified',
        `Could not find element that matches selector "${selector}"`
      );
      console.error(`Bindery: Could not find element that matches selector "${selector}"`);
      return null;
    }
    return sourceNode;
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

  async makeBook(doneBinding) {
    if (!this.source) {
      document.body.classList.add(c('viewing'));
      return;
    }

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

    this.layoutInProgress = true;
    this.viewer.clear(); // In case we're updating an existing layout
    document.body.classList.add(c('viewing'));
    this.pageSetup.updateStyleVars();
    this.viewer.setInProgress();

    try {
      const book = await paginate(
        content,
        this.rules,
        partialBook => this.viewer.renderProgress(partialBook)
      );
      this.viewer.render(book);
      this.layoutInProgress = false;
      if (doneBinding) doneBinding();
      this.viewer.element.classList.remove(c('in-progress'));
    } catch (e) {
      this.layoutInProgress = false;
      this.viewer.element.classList.remove(c('in-progress'));
      this.viewer.displayError('Layout couldn\'t complete', e);
      console.error(e);
    }
  }
}
Bindery.version = BINDERY_VERSION;


export default Bindery;
