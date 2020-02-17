/* global BINDERY_VERSION */
import Bindery from './bindery';
import rules from './rules';
import { Mode, Paper, Layout, Marks } from './constants';
import '../src/main.scss';

declare const BINDERY_VERSION: string;

const constants = {
    View: Mode,
    Paper,
    Layout,
    Marks,
    version: BINDERY_VERSION,
}

const BinderyWithRules = Object.assign(Bindery, rules, constants);

export default BinderyWithRules;
