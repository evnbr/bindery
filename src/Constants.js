const Mode = Object.freeze({
  FLIPBOOK: 'view_flipbook',
  PREVIEW: 'view_preview',
  PRINT: 'view_print',
});

const Paper = Object.freeze({
  AUTO: 'paper_auto',
  AUTO_BLEED: 'paper_auto_bleed',
  AUTO_MARKS: 'paper_auto_marks',
  LETTER_PORTRAIT: 'paper_letter_p',
  LETTER_LANDSCAPE: 'paper_letter_l',
  A4_PORTRAIT: 'paper_a4_p',
  A4_LANDSCAPE: 'paper_a4_l',
});

const Layout = Object.freeze({
  PAGES: 'layout_pages',
  SPREADS: 'layout_spreads',
  BOOKLET: 'layout_booklet',
});

const Marks = Object.freeze({
  NONE: 'marks_none',
  SPREADS: 'layout_spreads',
  BOTH: 'marks_both',
});

export { Mode, Paper, Layout, Marks };
