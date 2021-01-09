import prefixer from './prefixer';

export interface DomAttributes {
  id: String;
  onchange: (e: Event) => any;
  onclick: (e: Event) => any;
  value: any;
  selected: any;
  disabled: any;
}

export interface ElementWrapper {
  element: HTMLElement
}

type Appendable = string | HTMLElement | ElementWrapper;

const isElement = (node: any) => node.nodeType === Node.ELEMENT_NODE;
const isObj = (val: any) => typeof val === 'object';
const isFunc = (val: any) => typeof val === 'function';
const isStr = (val: any) => typeof val === 'string';

const isElementWrapper = (val: any): val is ElementWrapper => val?.element && isElement(val.element);

export const h = (
  tagName: string,
  classNames: string | null,
  attrs: Partial<DomAttributes>,
  ...children: (Appendable)[]
) => {
  const el = document.createElement(tagName);
  if (classNames)
    el.className = classNames
      .split('.')
      .filter(txt => txt !== '')
      .map(prefixer)
      .join(' ');
  if (attrs)
    for (const k in attrs) {
      // @ts-ignore TODO replace with hyperscript anyways
      const v = attrs[k];
      // @ts-ignore TODO replace with hyperscript anyways
      if (isFunc(v)) el[k] = v;
      else el.setAttribute(k, v);
    }
  if (children) {
    el.append(...children.map(item => {
      return isElementWrapper(item) ? item.element : item;
    }));
  }
  return el;
};

export const div = (cls: string, ...children: Appendable[]) => {
  return h('div', cls, {}, ...children) as HTMLDivElement;
};

export const button = (cls: string, attrs: Partial<DomAttributes>, label: string) => {
  return h('button', cls, attrs, label) as HTMLButtonElement;
};

export const select = (
  cls: string,
  attrs: Partial<DomAttributes>,
  ...optionElements: HTMLOptionElement[]
) => {
  return h('select', cls, attrs, ...optionElements) as HTMLSelectElement;
};

export const option = (attrs: Partial<DomAttributes>, label: string) => {
  return h('option', null, attrs, label) as HTMLOptionElement;
};