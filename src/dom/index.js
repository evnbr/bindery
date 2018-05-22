const doc = window.document;
//
// prefix classes
const p = '📖-';

const prefix = str => `${p}${str}`;
const prefixClass = str => `.${prefix(str)}`;

const prefixer = (str) => {
  if (str[0] === '.') {
    return prefixClass(str.substr(1));
  }
  return prefix(str);
};

// Create div with prefixed classes
const createEl = (className, content = []) => {
  const div = doc.createElement('div');
  div.className = className.split('.').filter(txt => txt !== '').map(prefixer).join(' ');

  if (typeof content === 'string') {
    div.textContent = content;
  } else if (Array.isArray(content)) {
    content.forEach(child => div.appendChild(child));
  }
  return div;
};

// Create stylesheet with id
const addStylesheet = (id) => {
  const style = doc.createElement('style');
  style.id = id;
  doc.head.appendChild(style);
  return style;
};

// Fetch or create stylesheet with id
const stylesheet = id => doc.querySelector(`#${id}`) || addStylesheet(id);

// Parse html from text
const parseHTML = (text, selector) => {
  const wrapper = doc.createElement('div');
  wrapper.innerHTML = text;
  return wrapper.querySelector(selector);
};

const c = prefixer;
export { c, createEl, stylesheet, parseHTML };
