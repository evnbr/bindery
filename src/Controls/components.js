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
  return h(`button.${c('btn')}`, ...arg);
};

const btnLight = function (...arg) {
  return h(`button.${c('btn')}.${c('btn-light')}`, ...arg);
};

const btnMain = function (...arg) {
  return h(`button.${c('btn')}.${c('btn-main')}`, ...arg);
};

const select = function (...arg) {
  const selectVal = h(c('.select-val'), 'Value');
  const selectEl = h(`select.${c('select')}`, ...arg);
  const updateVal = () => {
    selectVal.textContent = selectEl.options[selectEl.selectedIndex].text;
  };
  selectEl.addEventListener('change', updateVal);
  updateVal();
  return h(c('.select-wrap'),
    selectVal,
    selectEl
  );
};


const option = function (...arg) {
  return h('option', ...arg);
};

// View Swithcer
// const viewMode = function (id, action) {
//   const sel = `.${c('viewmode')}.${c(id)}`;
//   return h(sel,
//     { onclick: action },
//     h(c('.icon')),
//     // text
//   );
// };

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
