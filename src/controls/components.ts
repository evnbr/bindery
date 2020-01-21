import { div, button, select, option } from './dom';
import { c, createEl } from '../dom-utils';

const row = (children: HTMLElement[]) => createEl('row', children);

// Button
const btn = (attrs: {}, txt: string) => {
  return button(`${c('control')} ${c('btn')}`, attrs, txt);
}
const btnMain = (attrs: {}, txt: string) => {
  return button(`${c('control')} ${c('btn')} ${c('btn-main')}`, attrs, txt);
}

const dropdown = (attrs: {}, options: HTMLOptionElement[]) => {
  const selectVal = createEl('select-val', []);
  selectVal.textContent = 'Value';
  const selectEl = select(c('select'), attrs, options);
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
