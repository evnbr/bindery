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
  const div = document.createElement('div');
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
  const style = document.createElement('style');
  style.id = id;
  document.head.appendChild(style);
  return style;
};

// Fetch or create stylesheet with id
const stylesheet = id => document.querySelector(`#${id}`) || addStylesheet(id);


export { prefixer, createEl, stylesheet };
