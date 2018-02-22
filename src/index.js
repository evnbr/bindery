import Bindery from './bindery';
import Rules from './Rules';
import { Mode, Paper, Layout, Marks } from './Constants';

const BinderyWithRules = Object.assign(Bindery, Rules);
BinderyWithRules.View = Mode;
BinderyWithRules.Paper = Paper;
BinderyWithRules.Layout = Layout;
BinderyWithRules.Marks = Marks;

export default BinderyWithRules;
