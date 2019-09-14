import { div, button, select, option } from './dom';
import { c, createEl } from '../dom-utils';

const row = (children) => createEl('row', children);

// Button
const btn = (attrs, txt) => button(`${c('control')} ${c('btn')}`, attrs, txt);
const btnMain = (attrs, txt) => button(`${c('control')} ${c('btn')} ${c('btn-main')}`, attrs, txt);

const dropdown = (attrs, options) => {
  const selectVal = createEl('select-val', [], 'Value');
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
