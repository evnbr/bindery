import PageBreak from './PageBreak';
import FullPage from './FullPage';
import Spread from './Spread';
import Footnote from './Footnote';
import PageReference from './PageReference';
import RunningHeader from './RunningHeader';
import BinderyRule from './BinderyRule';

export default {
  Spread,
  FullPage,
  Footnote,
  PageBreak,
  RunningHeader,
  PageReference,
  BinderyRule,
  createRule(options) {
    return new BinderyRule(options);
  },
};
