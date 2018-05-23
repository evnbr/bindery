/* global BINDERY_VERSION */

// main
import PageSetup from './PageSetup';
import { Mode, Paper, Layout, Marks } from './Constants';
import { defaultRules } from '../defaults';

// components
import paginate from '../paginate';
import Viewer from '../viewer';
import rules from '../rules';
import { validate, T } from '../option-checker';
import { parseHTML } from '../dom-utils';

// style
import './main.scss';

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

    validate(opts, {
      name: 'makeBook',
      autorun: T.bool,
      content: T.any,
      ControlsComponent: T.func,
      view: T.enum(...Object.values(Mode)),
      pageSetup: T.shape({
        name: 'pageSetup',
        margin: T.margin,
        size: T.size,
      }),
      printSetup: T.shape({
        name: 'printSetup',
        bleed: T.length,
        layout: T.enum(...Object.values(Layout)),
        marks: T.enum(...Object.values(Marks)),
        paper: T.enum(...Object.values(Paper)),
      }),
      rules: T.array,
    });

    this.pageSetup = new PageSetup(opts.pageSetup, opts.printSetup);

    const startLayout = opts.printSetup ? opts.printSetup.layout || Layout.PAGES : Layout.PAGES;
    const startMarks = opts.printSetup ? opts.printSetup.marks || Marks.CROP : Marks.CROP;
    this.viewer = new Viewer({
      pageSetup: this.pageSetup,
      mode: opts.view || Mode.PREVIEW,
      marks: startMarks,
      layout: startLayout,
      ControlsComponent: opts.ControlsComponent,
    });

    this.rules = defaultRules;
    if (opts.rules) this.addRules(opts.rules);

    this.getContentAsElement(opts.content).then((el) => {
      this.content = el;
      if (el && this.autorun) this.makeBook();
    });
  }

  // Convenience constructor
  static makeBook(opts = {}) {
    opts.autorun = opts.autorun ? opts.autorun : true;
    return new Bindery(opts);
  }

  async getContentAsElement(content) {
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
      return this.fetchContent(content.url, content.selector);
    }
    throw Error('Bindery: Source must be an element or selector');
  }

  async fetchContent(url, sel) {
    const response = await fetch(url);
    if (response.status !== 200) {
      this.viewer.displayError(response.status, `Could not find file at "${url}"`);
      return null;
    }
    const fetchedContent = await response.text();
    const el = parseHTML(fetchedContent, sel);
    if (!(el instanceof HTMLElement)) {
      this.viewer.displayError(
        'Source not specified',
        `Could not find element that matches selector "${sel}"`
      );
      console.error(`Bindery: Could not find element that matches selector "${sel}"`);
      return null;
    }
    return el;
  }

  cancel() {
    this.viewer.hide();
    this.content.style.display = '';
  }

  addRules(newRules) {
    newRules.forEach((rule) => {
      if (rule instanceof rules.Rule) {
        this.rules.push(rule);
      } else {
        throw Error(`Bindery: The following is not an instance of Bindery.Rule and will be ignored: ${rule}`);
      }
    });
  }

  async makeBook() {
    if (!this.content) {
      this.viewer.show();
      return;
    }

    this.content.style.display = '';
    const content = this.content.cloneNode(true);
    this.content.style.display = 'none';

    this.layoutInProgress = true;
    this.viewer.clear(); // In case we're updating an existing layout
    this.viewer.show();
    this.pageSetup.updateStyleVars();
    this.viewer.inProgress = true;

    try {
      const book = await paginate(
        content,
        this.rules,
        (current, progress) => this.viewer.renderProgress(current, progress)
      );
      this.viewer.progress = 1;
      this.layoutInProgress = false;
      requestAnimationFrame(() => {
        this.viewer.render(book);
        this.viewer.inProgress = false;
      });
    } catch (e) {
      this.layoutInProgress = false;
      this.viewer.inProgress = false;
      this.viewer.displayError('Layout couldn\'t complete', e);
      console.error(e);
    }
  }
}
Bindery.version = BINDERY_VERSION;


export default Bindery;
