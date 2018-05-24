import { classes } from '../dom-utils';

const preserveNumbering = (oldPath, nextChild, originalList, newList) => {
  // restart numbering
  let prevStart = 1;
  if (originalList.hasAttribute('start')) {
    // the OL is also a continuation
    prevStart = parseInt(originalList.getAttribute('start'), 10);
  }
  if (nextChild && nextChild.tagName === 'LI') {
    // the first list item is a continuation
    prevStart -= 1;
  }
  const prevCount = originalList.children.length;
  const newStart = prevStart + prevCount;
  newList.setAttribute('start', newStart);
};

const preserveTableColumns = (oldPath, nextChild, originalRow, newRow, mark) => {
  const columns = [...originalRow.children];
  const currentIndex = columns.indexOf(nextChild);
  for (let i = 0; i < currentIndex; i += 1) {
    const clonedCol = columns[i].cloneNode(true); // deep clone, could be th > h3 > span;
    if (clonedCol.tagName === 'TH') {
      mark(columns[i], clonedCol);
    }
    newRow.appendChild(clonedCol);
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

  const mark = (original, clone) => {
    markAsToNext(original);
    markAsFromPrev(clone);
    applyRules(original, clone);
  };

  for (let i = oldPath.length - 1; i >= 0; i -= 1) {
    const original = oldPath[i];
    const clone = original.cloneNode(false); // shallow
    clone.innerHTML = '';

    mark(original, clone);

    // Special case for ordered lists
    if (clone.tagName === 'OL') {
      preserveNumbering(oldPath, oldPath[i + 1], original, clone);
    }

    // Special case to preserve columns of tables
    if (clone.tagName === 'TR') {
      preserveTableColumns(oldPath, oldPath[i + 1], original, clone, mark);
    }

    if (i < oldPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }

  return newPath;
};

export default clonePath;
