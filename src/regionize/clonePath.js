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

  const deepClone = (el) => {
    const clone = el.cloneNode(true); // deep clone, could be th > h3 > span;
    applyRules(el, clone);
    return clone;
  };

  for (let i = oldPath.length - 1; i >= 0; i -= 1) {
    const original = oldPath[i];
    const clone = original.cloneNode(false); // shallow
    const nextChild = oldPath[i + 1];
    clone.innerHTML = '';

    applyRules(original, clone, nextChild, deepClone);

    if (i < oldPath.length - 1) clone.appendChild(newPath[i + 1]);
    newPath[i] = clone;
  }

  return newPath;
};

export default clonePath;
