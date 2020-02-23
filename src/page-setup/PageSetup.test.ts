import { SheetSize } from '../constants';
import PageSetup from './PageSetup';

const pageOpts = {
  size: { width: '4in', height: '6in' },
};
const printOpts = {
  paper: SheetSize.AutoMarks,
  bleed: '8pt',
};
const pageSetup = new PageSetup(pageOpts, printOpts);

test('spreadSize is calculated from page', () => {
  expect(pageSetup.spreadSize).toEqual({ width: '8in', height: '6in' });
});

test('stylesheet is added to head', () => {
  let sheet = document.head.querySelector('#binderyPage');
  expect(sheet).toBeNull();
  pageSetup.updateStyleVars();
  sheet = document.head.querySelector('#binderyPage');
  expect(sheet.tagName).toBe('STYLE');
});

test('sheetSize works', () => {
  pageSetup.printTwoUp = false;
  pageSetup.paper = Paper.AUTO;
  expect(pageSetup.sheetSize).toEqual({ width: '4in', height: '6in' });

  pageSetup.paper = Paper.LETTER_PORTRAIT;
  expect(pageSetup.sheetSize).toEqual({ width: '8.5in', height: '11in' });

  pageSetup.paper = Paper.A4_LANDSCAPE;
  expect(pageSetup.sheetSize).toEqual({ width: '297mm', height: '210mm' });

  pageSetup.printTwoUp = true;
  pageSetup.paper = Paper.AUTO;
  expect(pageSetup.sheetSize).toEqual({ width: '8in', height: '6in' });
});

test('displaySize works', () => {
  pageSetup.printTwoUp = true;
  pageSetup.paper = Paper.AUTO;
  expect(pageSetup.displaySize).toEqual({ width: '8in', height: '6in', bleed: '8pt' });

  pageSetup.printTwoUp = false;
  expect(pageSetup.displaySize).toEqual({ width: '4in', height: '6in', bleed: '8pt' });
});
