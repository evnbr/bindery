import { classes } from '../dom-utils';

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

const clonePath = (oldPath, applyRules) => {
  const newPath = [];

  const markAsToNext = node => node.classList.add(classes.toNext);
  const markAsFromPrev = node => node.classList.add(classes.fromPrev);

  const finishSplitting = (original, clone, nextChild, cloneEl) => {
    markAsToNext(original);
    markAsFromPrev(clone);
    applyRules(original, clone, nextChild, cloneEl);
  };

  const deepClone = (el) => {
    const clone = el.cloneNode(true); // deep clone, could be th > h3 > span;
    finishSplitting(el, clone);
    return clone;
  };

  for (let i = oldPath.length - 1; i >= 0; i -= 1) {
    const original = oldPath[i];
    const clone = original.cloneNode(false); // shallow
    const nextChild = oldPath[i + 1];
    clone.innerHTML = '';

    finishSplitting(original, clone, nextChild, deepClone);

    if (i < oldPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }

  return newPath;
};

export default clonePath;
