import { classes } from '../dom-utils';

const preserveNumbering = (oldPath, i, originalList, newList) => {
  // restart numbering
  let prevStart = 1;
  if (originalList.hasAttribute('start')) {
    // the OL is also a continuation
    prevStart = parseInt(originalList.getAttribute('start'), 10);
  }
  if (i < oldPath.length - 1 && oldPath[i + 1].tagName === 'LI') {
    // the first list item is a continuation
    prevStart -= 1;
  }
  const prevCount = originalList.children.length;
  const newStart = prevStart + prevCount;
  newList.setAttribute('start', newStart);
};

const preserveTableColumns = (oldPath, pathIndex, originalRow, newRow, markAsToNext, markAsFromPrev) => {
  const columns = [...originalRow.children];
  const nextChild = oldPath[pathIndex + 1];
  const currentIndex = columns.indexOf(nextChild);
  for (let i = 0; i < currentIndex; i += 1) {
    const clonedCol = columns[i].cloneNode(true); // deep clone, could be th > h3 > span;
    if (clonedCol.tagName === 'TH') {
      markAsToNext(columns[i]);
      markAsFromPrev(clonedCol);
    }
    newRow.appendChild(clonedCol);
  }
};


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

const clonePath = (oldPath, extraClasses) => {
  const newPath = [];

  const { toNext, fromPrev } = extraClasses;
  const markAsToNext = (node) => {
    node.classList.add(classes.toNext);
    toNext.forEach(cl => node.classList.add(cl));
  };

  const markAsFromPrev = (node) => {
    node.classList.add(classes.fromPrev);
    fromPrev.forEach(cl => node.classList.add(cl));
  };

  for (let i = oldPath.length - 1; i >= 0; i -= 1) {
    const original = oldPath[i];
    const clone = original.cloneNode(false); // shallow
    clone.innerHTML = '';

    markAsToNext(original);
    markAsFromPrev(clone);

    // Special case for ordered lists
    if (clone.tagName === 'OL') {
      preserveNumbering(oldPath, i, original, clone);
    }

    // Special case to preserve columns of tables
    if (clone.tagName === 'TR') {
      preserveTableColumns(oldPath, i, original, clone, markAsToNext, markAsFromPrev);
    }

    if (i < oldPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }

  return newPath;
};

export default clonePath;
