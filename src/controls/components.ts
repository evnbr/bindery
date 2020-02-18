import { div, button, select, option } from './dom';
import { prefixer, createEl } from '../dom-utils';

const row = (children: HTMLElement[]) => createEl('row', children);

// Button
const btn = (attrs: {}, txt: string) => {
  return button(`${prefixer('control')} ${prefixer('btn')}`, attrs, txt);
}
const btnMain = (attrs: {}, txt: string) => {
  return button(`${prefixer('control')} ${prefixer('btn')} ${prefixer('btn-main')}`, attrs, txt);
}

const dropdown = (attrs: {}, options: HTMLOptionElement[]) => {
  const selectVal = createEl('select-val', []);
  selectVal.textContent = 'Value';
  const selectEl = select(prefixer('select'), attrs, options);
  const updateVal = () => {
    selectVal.textContent = selectEl.options[selectEl.selectedIndex].text;
  };
  selectEl.addEventListener('change', updateVal);
  updateVal();
  return createEl('.select-wrap.control', [selectVal, selectEl]);
};

export {
  row,
  btn,
  btnMain,
  dropdown,
  option,
  div,
};
