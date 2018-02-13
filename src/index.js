import Bindery from './bindery';
import Rules from './Rules';
import { Mode, Paper, Layout } from './Constants';

const BinderyWithRules = Object.assign(Bindery, Rules);
BinderyWithRules.View = Mode;
BinderyWithRules.Paper = Paper;
BinderyWithRules.Layout = Layout;

export default BinderyWithRules;
