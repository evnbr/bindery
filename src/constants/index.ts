declare const BINDERY_CLASS_PREFIX: string;

export const classPrefix = BINDERY_CLASS_PREFIX;

export enum SheetLayout {
  PAGES = 'pages',
  SPREADS = 'spreads',
  BOOKLET = 'booklet'
}

export enum SheetMarks {
  NONE,
  CROP,
  BLEED,
  BOTH
}

export enum SheetSize {
  AUTO = 'auto',
  AUTO_BLEED = 'auto-bleed',
  AUTO_MARKS = 'auto-marks',
  LETTER_PORTRAIT = 'letter-portrait',
  LETTER_LANDSCAPE = 'letter-landscape',
  A4_PORTRAIT = 'a4-portrait',
  A4_LANDSCAPE = 'a4-landscape'
}

export enum ViewerMode {
  FLIPBOOK = 'flipbook',
  PREVIEW = 'preview',
  PRINT = 'print'
}
