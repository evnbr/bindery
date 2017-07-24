import BreakBefore from './BreakBefore';
import BreakAfter from './BreakAfter';
import FullPage from './FullPage';
import Spread from './Spread';
import Footnote from './Footnote';
import PageReference from './PageReference';
import PageNumber from './PageNumber';
import RunningHeader from './RunningHeader';
import BinderyRule from './BinderyRule';

export default {
  Spread,
  FullPage,
  Footnote,
  BreakBefore,
  BreakAfter,
  PageNumber,
  RunningHeader,
  PageReference,
  BinderyRule,
  createRule(options) {
    return new BinderyRule(options);
  },
};
