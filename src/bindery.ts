/* global BINDERY_VERSION */

// main
import PageSetup from './page-setup';
import { ViewerMode, SheetSize, SheetLayout, PageMarks } from './constants';
import defaultRules from './defaults';

// components
import makeBook from './makeBook';
import Viewer from './viewer';
import rules from './rules';
import { validateRuntimeOptions, RuntimeTypes } from './runtimeOptionChecker';
import { parseHTML } from './dom';
import { Book } from './book';
import Rule from './rules/Rule';

const vals = (obj: { [key: string]: any}) => {
  return Object.keys(obj).map(k => obj[k]);
};
const nextFrame = () => new Promise((resolve) => {
  requestAnimationFrame(t => resolve(t));
});

declare const BINDERY_VERSION: string;

interface PrintSetup {
  layout: SheetLayout
  marks: PageMarks,
}

interface BinderyOptions {
  autoupdate?: boolean;
  autorun?: boolean;
  ControlsComponent?: any;
  content?: HTMLElement;
  pageNumberOffset?: number;
  printSetup?: PrintSetup;
  pageSetup?: {};
  rules?: any[];
  view?: ViewerMode;
}

class Bindery {
  autorun: boolean;
  autoupdate: boolean;
  viewer: Viewer;
  content!: HTMLElement;
  pageSetup: PageSetup;
  rules: Rule[];
  layoutInProgress: boolean = false;

  constructor(opts: BinderyOptions = {}) {
    console.log(`📖 Bindery ${BINDERY_VERSION}`);

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;

    validateRuntimeOptions(opts, {
      name: 'makeBook',
      autorun: RuntimeTypes.bool,
      content: RuntimeTypes.any,
      view: RuntimeTypes.enum(...vals(ViewerMode)),
      pageNumberOffset: RuntimeTypes.number,
      pageSetup: RuntimeTypes.shape({
        name: 'pageSetup',
        margin: RuntimeTypes.margin,
        size: RuntimeTypes.size,
      }),
      printSetup: RuntimeTypes.shape({
        name: 'printSetup',
        bleed: RuntimeTypes.length,
        layout: RuntimeTypes.enum(...vals(SheetLayout)),
        marks: RuntimeTypes.enum(...vals(PageMarks)),
        paper: RuntimeTypes.enum(...vals(SheetSize)),
      }),
      rules: RuntimeTypes.array,
    });

    this.pageSetup = new PageSetup(opts.pageSetup, opts.printSetup);

    const startLayout = opts.printSetup ? opts.printSetup.layout || SheetLayout.PAGES : SheetLayout.PAGES;
    const startMarks = opts.printSetup ? opts.printSetup.marks || PageMarks.CROP : PageMarks.CROP;
    this.viewer = new Viewer({
      pageSetup: this.pageSetup,
      mode: opts.view || ViewerMode.PREVIEW,
      marks: startMarks,
      layout: startLayout,
    });
    if (!opts.content) {
      this.viewer.displayError('Content not specified', 'You must include a source element, selector, or url');
      throw Error('Bindery: You must include a source element or selector');
    }
    if (opts.ControlsComponent) {
      this.viewer.displayError('Controls are now included', 'Please remove the controls component');
      throw Error('Bindery: controls are now included');
    }

    this.rules = defaultRules;
    this.rules.push(new Rule({ pageNumberOffset: opts.pageNumberOffset || 0 }));
    if (opts.rules) this.addRules(opts.rules);

    this.getContentAsElement(opts.content).then((el) => {
      this.content = el;
      if (el && this.autorun) this.makeBook();
    });
  }

  // Convenience constructor
  static makeBook(opts: BinderyOptions = {}) {
    opts.autorun = opts.autorun ? opts.autorun : true;
    return new Bindery(opts);
  }

  async getContentAsElement(content: any): Promise<HTMLElement> {
    if (content instanceof HTMLElement) return content;
    if (typeof content === 'string') {
      const el = document.querySelector(content);
      if (!(el instanceof HTMLElement)) {
        this.viewer.displayError('Content not specified', `Could not find element that matches selector "${content}"`);
        console.error(`Bindery: Could not find element that matches selector "${content}"`);
      }
      return el as HTMLElement;
    }
    if (typeof content === 'object' && content.url) {
      return this.fetchContent(content.url, content.selector);
    }
    throw Error('Bindery: Source must be an element or selector');
  }

  async fetchContent(url: string, selector?: string) {
    const response = await fetch(url);
    if (response.status !== 200) {
      this.viewer.displayError(`${response.status}`, `Could not find file at "${url}"`);
      throw Error(`Bindery: Could not find file at "${url}"`);
    }
    const fetchedContent = await response.text();
    const el = parseHTML(fetchedContent, selector);
    if (!(el instanceof HTMLElement)) {
      this.viewer.displayError(
        'Source not specified',
        `Could not find element that matches selector "${selector}"`
      );
      throw Error(`Bindery: Could not find element that matches selector "${selector}"`);
    }
    return el;
  }

  cancel() {
    this.viewer.hide();
    if (this.content) this.content.style.display = '';
  }

  addRules(newRules: any[]) {
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
      console.error('No content');
      return null;
    }

    this.content.style.display = '';
    const content = this.content.cloneNode(true) as HTMLElement;
    this.content.style.display = 'none';

    this.layoutInProgress = true;
    this.viewer.clear(); // In case we're updating an existing layout
    this.viewer.show();
    this.pageSetup.updateStyleVars();
    this.viewer.isInProgress = true;

    try {
      const onProgress = (current: Book, progress: number) => this.viewer.updateProgress(current, progress);
      const book = await makeBook(content, this.rules, onProgress);
      this.viewer.progress = 1;
      this.layoutInProgress = false;
      await nextFrame();
      this.viewer.render(book);
      this.viewer.isInProgress = false;
      return book;
    } catch (e) {
      this.layoutInProgress = false;
      this.viewer.isInProgress = false;
      this.viewer.displayError('Layout couldn\'t complete', e.message);
      console.error(e);
      return null;
    }
  }
}

export default Bindery;
