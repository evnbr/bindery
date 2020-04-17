import { HierarchyEntry } from '../types';

class HierarchyToHeadingAdapter {
  hierarchy: HierarchyEntry[] = [];

  textFor(sel: string): string | undefined {
    return this.hierarchy.find(entry => entry?.selector === sel)?.text;
  }

  get h1() {
    return this.textFor('h1');
  }
  get h2() {
    return this.textFor('h2');
  }
  get h3() {
    return this.textFor('h3');
  }
  get h4() {
    return this.textFor('h4');
  }
  get h5() {
    return this.textFor('h5');
  }
  get h6() {
    return this.textFor('h6');
  }
}

export { HierarchyToHeadingAdapter };
