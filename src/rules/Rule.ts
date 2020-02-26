import {
  RuleOptionBreakPosition,
  RuleOptionFlowPosition,
  RuleOptionPageRotation,
} from '../types';

export interface RuleOptions {
  name?: string;
  selector?: string;
  position?: RuleOptionBreakPosition;
  continue?: RuleOptionFlowPosition;
  rotate?: RuleOptionPageRotation;
  pageNumberOffset?: number
}


export class Rule {
  name: string;
  selector: string;
  [key: string]: any

  constructor(options: RuleOptions) {
    this.name = options.name ?? 'Unnamed Bindery Rule';
    this.selector = '';

    Object.keys(options).forEach((key) => {
      this[key] = options[key as keyof RuleOptions];
    });
  }

  setup() {

  }
}
