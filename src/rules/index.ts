import Counter, { CounterRuleOptions } from './Counter';
import FullBleedSpread, {
  FullBleedSpreadPageRuleOptions,
} from './FullBleedSpread';
import FullBleedPage, { FullBleedPageRuleOptions } from './FullBleedPage';
import Footnote, { FootnoteRuleOptions } from './Footnote';
import PageReference, { PageReferenceRuleOptions } from './PageReference';
import PageBreak, { PageBreakRuleOptions } from './PageBreak';
import RunningHeader, { RunningHeaderRuleOptions } from './RunningHeader';
import Replace, { ReplaceRuleOptions } from './Replace';
import { Rule, RuleOptions } from './Rule';
import Split, { SplitRuleOptions } from './Split';

export default {
  Rule,
  Split(options: Partial<SplitRuleOptions>) {
    return new Split(options);
  },
  Counter(options: Partial<CounterRuleOptions>) {
    return new Counter(options);
  },
  FullBleedPage(options: Partial<FullBleedPageRuleOptions>) {
    return new FullBleedPage(options);
  },
  Footnote(options: Partial<FootnoteRuleOptions>) {
    return new Footnote(options);
  },
  RunningHeader(options: Partial<RunningHeaderRuleOptions>) {
    return new RunningHeader(options);
  },
  Replace(options: Partial<ReplaceRuleOptions>) {
    return new Replace(options);
  },
  FullBleedSpread(options: Partial<FullBleedSpreadPageRuleOptions>) {
    return new FullBleedSpread(options);
  },
  PageBreak(options: Partial<PageBreakRuleOptions>) {
    return new PageBreak(options);
  },
  PageReference(options: Partial<PageReferenceRuleOptions>) {
    return new PageReference(options);
  },
  createRule(options: Partial<RuleOptions>) {
    return new Rule(options);
  },
};
