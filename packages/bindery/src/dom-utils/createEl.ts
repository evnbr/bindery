import prefixer from './prefixer';

const doc = window.document;
// Create div with prefixed classes
const createEl = (className: String, content = []): HTMLElement => {
  const div = doc.createElement('div');
  div.className = className.split('.').filter((txt) => txt !== '').map(prefixer).join(' ');

  if (typeof content === 'string') {
    div.textContent = content;
  } else if (Array.isArray(content)) {
    div.append(...content);
  }
  return div;
};

export default createEl;
