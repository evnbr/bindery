/* global BINDERY_VERSION */

// main
import PageSetup from './page-setup';
import { ViewerMode, SheetSize, SheetLayout, SheetMarks } from './constants';
import defaultRules from './defaults';

// components
import makeBook from './makeBook';
import { getContentAsElement } from './makeBook/getContent';
import Viewer from './viewer';
import rules from './rules';
import { validateRuntimeOptions, RuntimeTypes } from './runtimeOptionChecker';
import { Book } from './book';
import { Rule } from './rules/Rule';

const vals = (obj: { [key: string]: any}) => {
  return Object.keys(obj).map(k => obj[k]);
};
const nextFrame = () => new Promise((resolve) => {
  requestAnimationFrame(t => resolve(t));
});

declare const BINDERY_VERSION: string;

interface PrintSetup {
  layout: SheetLayout
  marks: SheetMarks,
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
        marks: RuntimeTypes.enum(...vals(SheetMarks)),
        paper: RuntimeTypes.enum(...vals(SheetSize)),
      }),
      rules: RuntimeTypes.array,
    });

    this.autorun = opts.autorun ?? true;
    this.autoupdate = opts.autoupdate ?? false;
    this.pageSetup = new PageSetup(opts.pageSetup, opts.printSetup);

    const startLayout = opts.printSetup?.layout ?? SheetLayout.PAGES;
    const startMarks = opts.printSetup?.marks ?? SheetMarks.CROP;

    this.viewer = new Viewer({
      pageSetup: this.pageSetup,
      mode: opts.view ?? ViewerMode.PREVIEW,
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
    this.rules.push(new Rule({ pageNumberOffset: opts.pageNumberOffset ?? 0 }));
    opts.rules?.forEach((rule) => {
      if (rule instanceof rules.Rule) {
        this.rules.push(rule);
      } else {
        throw Error(`Bindery: The following is not an instance of Bindery.Rule and will be ignored: ${rule}`);
      }
    });  

    if (this.autorun) this.makeBook(opts.content);
  }

  // Convenience constructor
  static makeBook(opts: BinderyOptions = {}) {
    opts.autorun = opts.autorun ?? true;
    return new Bindery(opts);
  }

  cancel() {
    this.viewer.hide();
    if (this.content) this.content.style.display = '';
  }

  async makeBook(contentDescription: any): Promise<Book | undefined> {
    try {
      this.content = await getContentAsElement(contentDescription)
    } catch(e) {
      this.viewer.show();
      this.viewer.displayError('', e.message);
      // throw e;
      return undefined;
    }

    this.content.style.display = '';
    const content = this.content.cloneNode(true) as HTMLElement;
    this.content.style.display = 'none';

    this.layoutInProgress = true;
    this.viewer.clear(); // In case we're updating an existing layout
    this.viewer.show();
    this.pageSetup.updateStyleVars();
    this.viewer.isInProgress = true;

    const onProgress = (currentBook: Book, progress: number) => {
      this.viewer.updateProgress(currentBook, progress);
    }

    try {
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
      // throw e;
      return undefined;
    }
  }
}

export default Bindery;
