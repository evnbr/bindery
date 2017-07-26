import h from 'hyperscript';
import { cssNumberPattern } from '../utils/convertUnits';

// Structure
const heading = function (...arg) {
  return h('.bindery-label', ...arg);
};

const row = function (...arg) {
  return h('.bindery-toggle', ...arg);
};

// Button
const btn = function (...arg) {
  return h('button.bindery-btn', ...arg);
};

const btnMini = function (...arg) {
  return h('button.bindery-btn.bindery-btn-mini', ...arg);
};

const btnMain = function (...arg) {
  return h('button.bindery-btn.bindery-btn-main', ...arg);
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
const toggleSwitch = () => h('.bindery-switch', h('.bindery-switch-handle'));

const switchRow = function (...arg) {
  return h('.bindery-toggle', ...arg, toggleSwitch);
};

export {
  row,
  heading,
  btn,
  btnMain,
  btnMini,
  select,
  option,
  switchRow,
  inputNumberUnits,
};
