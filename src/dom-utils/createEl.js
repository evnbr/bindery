import prefixer from './prefixer';

const doc = window.document;
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

export default createEl;
