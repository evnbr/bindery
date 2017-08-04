import h from 'hyperscript';
import { prefix, prefixClass } from '../utils/prefixClass';
import { cssNumberPattern } from '../utils/convertUnits';

const title = function (...arg) {
  return h(prefixClass('title'), ...arg);
};

// Structure
const heading = function (...arg) {
  return h(prefixClass('heading'), ...arg);
};

const row = function (...arg) {
  return h(prefixClass('row'), ...arg);
};

const expandRow = function (...arg) {
  return h(
    `.${prefix('row')}.${prefix('expand-row')}`,
    { onclick() {
      this.classList.toggle('selected');
    } },
    ...arg);
};
const expandArea = function (...arg) {
  return h(prefixClass('expand-area'), ...arg);
};


// Button
const btn = function (...arg) {
  return h(`button.${prefix('btn')}`, ...arg);
};

const btnMain = function (...arg) {
  return h(`button.${prefix('btn')}.${prefix('btn-main')}`, ...arg);
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
const toggleSwitch = () => h(prefixClass('switch'), h(prefixClass('switch-handle')));

const switchRow = function (...arg) {
  return h(prefixClass('row'), ...arg, toggleSwitch);
};

// View Swithcer
const viewMode = function (id, action, text) {
  const sel = `.${prefix('viewmode')}.${prefix(id)}`;
  return h(sel,
    { onclick: action },
    h(prefixClass('icon')),
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
  btnMain,
  select,
  option,
  switchRow,
  inputNumberUnits,
  viewMode,
};
