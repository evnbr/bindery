import h from 'hyperscript';
import c from '../utils/prefixClass';
import { cssNumberPattern } from '../utils/convertUnits';

const title = function (...arg) {
  return h(c('.title'), ...arg);
};

// Structure
const heading = function (...arg) {
  return h(c('.heading'), ...arg);
};

const row = function (...arg) {
  return h(c('.row'), ...arg);
};

const expandRow = function (...arg) {
  return h(
    `.${c('row')}.${c('expand-row')}`,
    { onclick() {
      this.classList.toggle('selected');
    } },
    ...arg);
};
const expandArea = function (...arg) {
  return h(c('.expand-area'), ...arg);
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

// Menu
const select = function (...arg) {
  return h('select', ...arg);
};

const option = function (...arg) {
  return h('option', ...arg);
};

// Input
const inputNumberUnits = function (val) {
  return h('input', {
    type: 'text',
    value: val,
    pattern: cssNumberPattern,
  });
};

// Switch
const toggleSwitch = () => h(c('.switch'), h(c('.switch-handle')));

const switchRow = function (...arg) {
  return h(c('.row'), ...arg, toggleSwitch);
};

// View Swithcer
const viewMode = function (id, action, text) {
  const sel = `.${c('viewmode')}.${c(id)}`;
  return h(sel,
    { onclick: action },
    h(c('.icon')),
    text
  );
};

export {
  title,
  row,
  expandRow,
  expandArea,
  heading,
  btn,
  btnLight,
  btnMain,
  select,
  option,
  switchRow,
  inputNumberUnits,
  viewMode,
};
