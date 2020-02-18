const isElement = (node: any) => node.nodeType === Node.ELEMENT_NODE;
const isObj = (val: any) => typeof val === 'object';
const isFunc = (val: any) => typeof val === 'function';
const isStr = (val: any) => typeof val === 'string';

interface Attrs {
  [key: string]: any
}

const h = (tagName: string, cls: string | null, attrs: Attrs, children: HTMLElement[], text?: string) => {
  const el = document.createElement(tagName);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    // @ts-ignore TODO replace with hyperscript anyways
    if (isFunc(v)) el[k] = v;
    else el.setAttribute(k, v);
  }
  if (children) children.forEach(c => el.appendChild(c));
  return el;
}

const div = (cls: string, children: HTMLElement[], label?: string) => {
  return h('div', cls, {}, children, label) as HTMLDivElement;
}
const button = (cls: string, attrs: {}, label?: string) => {
  return h('button', cls, attrs, [], label) as HTMLButtonElement;
}
const select = (cls: string, attrs: {}, children: HTMLElement[]) => {
  return h('select', cls, attrs, children) as HTMLSelectElement;
}
const option = (attrs: {}, label: string) => {
  return h('option', null, attrs, [], label) as HTMLOptionElement;
}

export { div, button, select, option };
