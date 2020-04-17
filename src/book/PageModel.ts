import { HierarchyEntry } from '../types';
import { HierarchyToHeadingAdapter } from './HierarchyToHeadingAdapter';

interface PageModel {
  isOutOfFlow: boolean; // used by spreads
  avoidReorder: boolean; // used by 2-page spreads
  footnotes: [];
  hierarchy: HierarchyEntry[];
  heading: HierarchyToHeadingAdapter; // used by running headers
  side?: 'left' | 'right';
  preferredSide?: 'left' | 'right';
  number?: number;
  isLeft: boolean;
  hasOutOfFlowContent: boolean;
  suppressOverflowError: boolean;
}

export { PageModel };
