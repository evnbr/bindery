import Region from './Region';

export type ElementChecker = (el: HTMLElement) => boolean;
export type ElementCloner = (el: HTMLElement) => HTMLElement;
export type ElementGetter = () => HTMLElement;

export type RegionGetter = () => Region;

export type RuleApplier = (
    original: HTMLElement,
    clone: HTMLElement,
    nextChild?: HTMLElement,
    cloner?: ElementCloner
) => void;
  