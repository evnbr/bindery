import h from 'hyperscript';
import c from '../utils/prefixClass';

const title = function (...arg) {
  return h(c('.title'), ...arg);
};

const heading = function (...arg) {
  return h(c('.heading'), ...arg);
};

const row = function (...arg) {
  return h(c('.row'), ...arg);
};

// Button
const btn = function (...arg) {
  return h(`button${c('.control')}${c('.btn')}`, ...arg);
};

const btnLight = function (...arg) {
  return h(`button${c('.control')}${c('.btn')}${c('.btn-light')}`, ...arg);
};

const btnMain = function (...arg) {
  return h(`button${c('.control')}${c('.btn')}${c('.btn-main')}`, ...arg);
};

const select = function (...arg) {
  const selectVal = h(c('.select-val'), 'Value');
  const selectEl = h(`select.${c('select')}`, ...arg);
  const updateVal = () => {
    selectVal.textContent = selectEl.options[selectEl.selectedIndex].text;
  };
  selectEl.addEventListener('change', updateVal);
  updateVal();
  return h(`${c('.select-wrap')}${c('.control')}`,
    selectVal,
    selectEl
  );
};


const option = function (...arg) {
  return h('option', ...arg);
};

export {
  title,
  row,
  heading,
  btn,
  btnLight,
  btnMain,
  select,
  option,
  // viewMode,
};
