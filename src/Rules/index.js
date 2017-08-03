import FullPage from './FullPage';
import Footnote from './Footnote';
import PageReference from './PageReference';
import RunningHeader from './RunningHeader';
import Replace from './Replace';
import Rule from './Rule';
import Spread from './Spread';
import PageBreak from './PageBreak';

export default {
  FullPage,
  Footnote,
  RunningHeader,
  Replace,
  Rule,
  Spread,
  PageBreak,
  PageReference,
  createRule(options) {
    return new Rule(options);
  },
};
