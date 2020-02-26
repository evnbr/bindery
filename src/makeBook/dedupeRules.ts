import FullBleedPage from '../rules/FullBleedPage';
import FullBleedSpread from '../rules/FullBleedSpread';
import PageBreak from '../rules/PageBreak';
import { Rule } from '../rules/Rule';

const isSpread = (rule: Rule) => rule instanceof FullBleedSpread;
const isPage = (rule: Rule) => rule instanceof FullBleedPage;
const isBreak = (rule: Rule) => rule instanceof PageBreak;

const isFullPageRule = (rule: Rule) => isSpread(rule) || isPage(rule) || isBreak(rule);

const dedupe = (inputRules: Rule[]): Rule[] => {
  const conflictRules = inputRules.filter(isFullPageRule);
  const output = inputRules.filter(rule => !conflictRules.includes(rule));

  const firstSpreadRule = conflictRules.find(isSpread);
  const firstPageRule = conflictRules.find(isPage);

  // Only apply one fullpage or fullspread
  if (firstSpreadRule) output.push(firstSpreadRule);
  else if (firstPageRule) output.push(firstPageRule);
  else output.push(...conflictRules); // but multiple pagebreaks are ok

  return output;
};

export default dedupe;
