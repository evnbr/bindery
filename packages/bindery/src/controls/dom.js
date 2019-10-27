const isElement = node => node.nodeType === Node.ELEMENT_NODE;
const isObj = val => typeof val === 'object';
const isFunc = val => typeof val === 'function';
const isStr = val => typeof val === 'string';


const h = (tagName, cls, attrs, children, text) => {
  const el = document.createElement(tagName);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (isFunc(v)) el[k] = v;
    else el.setAttribute(k, v);
  }
  if (children) children.forEach(c => el.appendChild(c));
  return el;
}

const div = (cls, children, label) => h('div', cls, {}, children, label);
const button = (cls, attrs, label) => h('button', cls, attrs, [], label);
const select = (cls, attrs, children) => h('select', cls, attrs, children);
const option = (attrs, label) => h('option', null, attrs, [], label);

export { div, button, select, option };
