export interface RuleOptions {
  name?: string;
  position?: 'before' | 'after' | 'both' | 'avoid';
  continue?: 'next' | 'left' | 'right' | 'same';
  rotate?: 'none' | 'inward' | 'outward' | 'clockwise' | 'counterclockwise';
  pageNumberOffset?: number
}


export default class Rule {
  name: string;
  selector: string;
  [key: string]: any

  constructor(options: RuleOptions) {
    this.name = options.name ? options.name : 'Unnamed Bindery Rule';
    this.selector = '';

    Object.keys(options).forEach((key) => {
      this[key] = options[key as keyof RuleOptions];
    });
  }

  setup() {

  }
}
