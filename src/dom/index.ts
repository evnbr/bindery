import { classes, classForMode, allModeClasses } from './classes';
import prefixer from './prefixer';
import safeMeasure from './safeMeasure';
export * from './dom';

const doc = window.document;

// Create stylesheet with id
const addStylesheet = (id: string): HTMLStyleElement => {
  const style = doc.createElement('style');
  style.id = id;
  doc.head.appendChild(style);
  return style;
};

// Fetch or create stylesheet with id
const stylesheet = (id: string): HTMLStyleElement => {
  return doc.querySelector(`#${id}`) ?? addStylesheet(id);
};

// Parse html from text
const parseHTML = (text: string, selector?: string) => {
  const wrapper = doc.createElement('div');
  wrapper.innerHTML = text;
  return selector ? wrapper.querySelector(selector) : wrapper;
};

export {
  prefixer,
  classes,
  classForMode,
  allModeClasses,
  stylesheet,
  safeMeasure,
  parseHTML
};
