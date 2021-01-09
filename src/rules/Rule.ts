import {
  RuleOptionBreakPosition,
  RuleOptionFlowPosition,
  RuleOptionPageRotation,
  CSSSelector,
} from '../types';

export interface RuleOptions {
  name: string;
  selector: string;
  position: RuleOptionBreakPosition;
  continue: RuleOptionFlowPosition;
  rotate: RuleOptionPageRotation;
  pageNumberOffset: number;
}

export abstract class Rule {
  name: string;
  selector: CSSSelector;
  [key: string]: any;

  constructor(options: Partial<RuleOptions>) {
    this.name = options?.name ?? 'Unnamed Bindery Rule';
    this.selector = '';

    Object.keys(options).forEach(key => {
      this[key] = options[key as keyof RuleOptions];
    });
  }

  setup() {}
}
