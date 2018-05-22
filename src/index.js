import Bindery from './main/bindery';
import rules from './rules';
import { Mode, Paper, Layout, Marks } from './main/Constants';

const BinderyWithRules = Object.assign(Bindery, rules);
BinderyWithRules.View = Mode;
BinderyWithRules.Paper = Paper;
BinderyWithRules.Layout = Layout;
BinderyWithRules.Marks = Marks;

export default BinderyWithRules;
