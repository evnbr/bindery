import c from './prefixClass';


// Small utility to create div with namespaced classes
const createEl = (className, content = []) => {
  const div = document.createElement('div');
  div.className = className.split('.').filter(txt => txt !== '').map(c).join(' ');

  if (typeof content === 'string') {
    div.textContent = content;
  } else if (Array.isArray(content)) {
    content.forEach(child => div.appendChild(child));
  }
  return div;
};

export default createEl;
