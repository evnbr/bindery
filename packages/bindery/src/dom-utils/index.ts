import classes from './classes';
import prefixer from './prefixer';
import safeMeasure from './safeMeasure';
import createEl from './createEl';

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
  return doc.querySelector(`#${id}`) || addStylesheet(id);
}

// Parse html from text
const parseHTML = (text: string, selector: string): HTMLElement => {
  const wrapper = doc.createElement('div');
  wrapper.innerHTML = text;
  return wrapper.querySelector(selector);
};

const c = prefixer;
export { c, classes, createEl, stylesheet, safeMeasure, parseHTML };
