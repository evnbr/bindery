/* global BINDERY_VERSION */
import Bindery from "./bindery";
import rules from "./rules";
import { Mode, Paper, Layout, Marks } from "./constants";
import Controls from "./controls";
import "./main.scss";

const BinderyWithRules = Object.assign(Bindery, rules);
BinderyWithRules.View = Mode;
BinderyWithRules.Paper = Paper;
BinderyWithRules.Layout = Layout;
BinderyWithRules.Marks = Marks;
BinderyWithRules.Controls = Controls;
BinderyWithRules.version = BINDERY_VERSION;

export default BinderyWithRules;
