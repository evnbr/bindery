/* global BINDERY_VERSION */
import Bindery from './bindery';
import rules from './rules';
import { Mode, Paper, Layout, Marks } from './constants';
import './main.scss';


const BinderyWithRules = Object.assign(Bindery, rules);
BinderyWithRules.View = Mode;
BinderyWithRules.Paper = Paper;
BinderyWithRules.Layout = Layout;
BinderyWithRules.Marks = Marks;
BinderyWithRules.version = BINDERY_VERSION;

export default BinderyWithRules;
