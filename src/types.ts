import { Page } from './book';

export type CSSSelector = string;

interface RemoteBookContent { url: string, selector?: CSSSelector };

export type BookContent = HTMLElement | CSSSelector | RemoteBookContent;

export type PageMaker = () => Page;

export type RuleOptionBreakPosition = 'before' | 'after' | 'both' | 'avoid';

export type RuleOptionFlowPosition = 'next' | 'left' | 'right' | 'same';

export type RuleOptionPageRotation =
  | 'none'
  | 'inward'
  | 'outward'
  | 'clockwise'
  | 'counterclockwise';

export type HierarchyEntry = { selector: string; text: string; el?: Element };
