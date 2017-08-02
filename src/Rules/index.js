import PageBreak from './PageBreak';
import FullPage from './FullPage';
import Spread from './Spread';
import Footnote from './Footnote';
import PageReference from './PageReference';
import RunningHeader from './RunningHeader';
import Rule from './Rule';

export default {
  Spread,
  FullPage,
  Footnote,
  PageBreak,
  RunningHeader,
  PageReference,
  Rule,
  createRule(options) {
    return new Rule(options);
  },
};
