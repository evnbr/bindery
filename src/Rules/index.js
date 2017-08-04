import FullPage from './FullPage';
import Footnote from './Footnote';
import PageReference from './PageReference';
import RunningHeader from './RunningHeader';
import Replace from './Replace';
import Rule from './Rule';
import Spread from './Spread';
import PageBreak from './PageBreak';

export default {
  Rule,
  FullPage(options) {
    return new FullPage(options);
  },
  Footnote(options) {
    return new Footnote(options);
  },
  RunningHeader(options) {
    return new RunningHeader(options);
  },
  Replace(options) {
    return new Replace(options);
  },
  Spread(options) {
    return new Spread(options);
  },
  PageBreak(options) {
    return new PageBreak(options);
  },
  PageReference(options) {
    return new PageReference(options);
  },
  createRule(options) {
    return new Rule(options);
  },
};
