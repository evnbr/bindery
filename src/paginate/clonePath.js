import { c } from '../utils';

// @param rules: array of Bindery.Rules
// @return: A new function that clones the given
// path according to those rules. (original : Array) => clone : Array
//
// The path is an array of nested elments,
// for example .content > article > p > a).
//
// It's shallowly cloned every time we move to the next page,
// to create the illusion that nodes are continuing from page
// to page.
//
// The transition can be customized by setting a Split rule,
// which lets you add classes to the original and cloned element
// to customize styling.

const clonePath = (oldPath, rules) => {
  const newPath = [];

  // TODO check if element actually matches
  const toNextClasses = rules
    .filter(rule => rule.customToNextClass)
    .map(rule => rule.customToNextClass);
  const fromPrevClasses = rules
    .filter(rule => rule.customFromPreviousClass)
    .map(rule => rule.customFromPreviousClass);

  const markAsToNext = (node) => {
    node.classList.add(c('continues'));
    toNextClasses.forEach(cl => node.classList.add(cl));
  };

  const markAsFromPrev = (node) => {
    node.classList.add(c('continuation'));
    fromPrevClasses.forEach(cl => node.classList.add(cl));
  };

  for (let i = oldPath.length - 1; i >= 0; i -= 1) {
    const original = oldPath[i];
    const clone = original.cloneNode(false); // shallow
    clone.innerHTML = '';

    markAsToNext(original);
    markAsFromPrev(clone);

    // Special case for ordered lists
    if (clone.tagName === 'OL') {
      // restart numbering
      let prevStart = 1;
      if (original.hasAttribute('start')) {
        // the OL is also a continuation
        prevStart = parseInt(original.getAttribute('start'), 10);
      }
      if (i < oldPath.length - 1 && oldPath[i + 1].tagName === 'LI') {
        // the first list item is a continuation
        prevStart -= 1;
      }
      const prevCount = original.children.length;
      const newStart = prevStart + prevCount;
      clone.setAttribute('start', newStart);
    }

    if (i < oldPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }

  return newPath;
};

export default clonePath;
