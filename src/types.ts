import { Page } from './book';

export type PageMaker = (() => Page);

export type RuleOptionBreakPosition = 'before' | 'after' | 'both' | 'avoid';

export type RuleOptionFlowPosition = 'next' | 'left' | 'right' | 'same';

export type RuleOptionPageRotation = 'none' | 'inward' | 'outward' | 'clockwise' | 'counterclockwise';

// export type PrintPageLayout = 'pages' | 'spreads' | 'booklet';

// export type ViewerMode = 'flipbook' | 'preview' | 'print';


