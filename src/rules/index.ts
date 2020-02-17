import Counter from './Counter';
import FullBleedSpread from './FullBleedSpread';
import FullBleedPage from './FullBleedPage';
import Footnote from './Footnote';
import PageReference from './PageReference';
import PageBreak from './PageBreak';
import RunningHeader from './RunningHeader';
import Replace from './Replace';
import Rule from './Rule';
import Split from './Split';

export default {
  Rule,
  Split(options: {}) {
    return new Split(options);
  },
  Counter(options: {}) {
    return new Counter(options);
  },
  FullBleedPage(options: {}) {
    return new FullBleedPage(options);
  },
  Footnote(options: {}) {
    return new Footnote(options);
  },
  RunningHeader(options: {}) {
    return new RunningHeader(options);
  },
  Replace(options: {}) {
    return new Replace(options);
  },
  FullBleedSpread(options: {}) {
    return new FullBleedSpread(options);
  },
  PageBreak(options: {}) {
    return new PageBreak(options);
  },
  PageReference(options: {}) {
    return new PageReference(options);
  },
  createRule(options: {}) {
    return new Rule(options);
  },
};
