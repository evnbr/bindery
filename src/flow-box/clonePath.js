import { classes } from '../dom-utils';

const preserveNumbering = (original, clone, nextChild) => {
  // restart numbering
  let prevStart = 1;
  if (original.hasAttribute('start')) {
    // the OL is also a continuation
    prevStart = parseInt(original.getAttribute('start'), 10);
  }
  if (nextChild && nextChild.tagName === 'LI') {
    // the first list item is a continuation
    prevStart -= 1;
  }
  const prevCount = original.children.length;
  const newStart = prevStart + prevCount;
  clone.setAttribute('start', newStart);
};

const preserveTableColumns = (original, clone, nextChild, deepClone) => {
  const columns = [...original.children];
  const currentIndex = columns.indexOf(nextChild);
  for (let i = 0; i < currentIndex; i += 1) {
    const clonedCol = deepClone(columns[i]);
    clone.appendChild(clonedCol);
  }
};


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

  // const { toNext, fromPrev } = extraClasses;
  const markAsToNext = (node) => {
    node.classList.add(classes.toNext);
    // toNext.forEach(cl => node.classList.add(cl));
  };

  const markAsFromPrev = (node) => {
    node.classList.add(classes.fromPrev);
    // fromPrev.forEach(cl => node.classList.add(cl));
  };

  const finishSplitting = (original, clone) => {
    markAsToNext(original);
    markAsFromPrev(clone);
    applyRules(original, clone);
  };

  const deepClone = (el) => {
    const clone = el.cloneNode(true); // deep clone, could be th > h3 > span;
    finishSplitting(el, clone);
    return clone;
  };

  for (let i = oldPath.length - 1; i >= 0; i -= 1) {
    const original = oldPath[i];
    const clone = original.cloneNode(false); // shallow
    clone.innerHTML = '';

    finishSplitting(original, clone);

    // Special case for ordered lists
    if (clone.tagName === 'OL') {
      preserveNumbering(original, clone, oldPath[i + 1]);
    }

    // Special case to preserve columns of tables
    if (clone.tagName === 'TR') {
      preserveTableColumns(original, clone, oldPath[i + 1], deepClone);
    }

    if (i < oldPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }

  return newPath;
};

export default clonePath;
