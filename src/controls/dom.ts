const isElement = (node: any) => node.nodeType === Node.ELEMENT_NODE;
const isObj = (val: any) => typeof val === 'object';
const isFunc = (val: any) => typeof val === 'function';
const isStr = (val: any) => typeof val === 'string';

interface DomAttributes {
  onchange?: (e: Event) => any,
  onclick?: (e: Event) => any,
  value?: string,
}

const h = (tagName: string, cls: string | null, attrs: DomAttributes, ...children: (string | HTMLElement)[]) => {
  const el = document.createElement(tagName);
  if (cls) el.className = cls;
  if (attrs) for (const k in attrs) {
    // @ts-ignore TODO replace with hyperscript anyways
    const v = attrs[k];
    // @ts-ignore TODO replace with hyperscript anyways
    if (isFunc(v)) el[k] = v;
    else el.setAttribute(k, v);
  }
  if (children) el.append(...children);
  return el;
}

const div = (cls: string, ...children: (string | HTMLElement)[]) => {
  return h('div', cls, {}, ...children) as HTMLDivElement;
}
const button = (cls: string, attrs: {}, label: string) => {
  return h('button', cls, attrs, label) as HTMLButtonElement;
}
const select = (cls: string, attrs: {}, ...optionElements: HTMLOptionElement[]) => {
  return h('select', cls, attrs, ...optionElements) as HTMLSelectElement;
}
const option = (attrs: {}, label: string) => {
  return h('option', null, attrs, label) as HTMLOptionElement;
}

export { div, button, select, option, DomAttributes };
