/* global BINDERY_VERSION */
import Bindery from './bindery';
import rules from './rules';
import { ViewerMode, SheetSize, SheetLayout, SheetMarks } from './constants';
import '../src/main.scss';

declare const BINDERY_VERSION: string;

const constants = {
  View: ViewerMode,
  Paper: SheetSize,
  Layout: SheetLayout,
  Marks: SheetMarks,
  version: BINDERY_VERSION
};

const BinderyWithRules = Object.assign(Bindery, rules, constants);

export default BinderyWithRules;
