import breakBefore from "./breakBefore";
import FullPage from "./FullPage";
import Spread from "./Spread";
import Footnote from "./Footnote";
import PageReference from "./PageReference";
import PageNumber from "./PageNumber";
import RunningHeader from "./RunningHeader";
import BinderyRule from "./BinderyRule";

export default {
  Spread: Spread,
  FullPage: FullPage,
  Footnote: Footnote,
  BreakBefore: breakBefore,
  PageNumber: PageNumber,
  RunningHeader: RunningHeader,
  PageReference: PageReference,
  BinderyRule: BinderyRule,
  createRule: function(options) {
    return new BinderyRule(options);
  }
}
