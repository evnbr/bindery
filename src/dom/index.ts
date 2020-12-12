import { classes, classForMode, allModeClasses } from './classes';
import prefixer from './prefixer';
import safeMeasure from './safeMeasure';
export * from './dom';

// Create stylesheet with id
const addStylesheet = (id: string): HTMLStyleElement => {
  const style = window.document.createElement('style');
  style.id = id;
  window.document.head.appendChild(style);
  return style;
};

// Fetch or create stylesheet with id
const stylesheet = (id: string): HTMLStyleElement => {
  return window.document.querySelector(`#${id}`) ?? addStylesheet(id);
};

// Parse html from text
const parseHTML = (text: string, selector?: string) => {
  const wrapper = window.document.createElement('div');
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
  parseHTML,
};
