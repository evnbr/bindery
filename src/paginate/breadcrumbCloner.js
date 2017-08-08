import c from '../utils/prefixClass';

// @param rules: array of Bindery.Rules
// @return: A new function that clones the given
// breadcrumb according to those rules. (original : Array) => clone : Array
//
// The breadcrumb is an array of nested elments,
// for example .content > article > p > a).
//
// It's shallowly cloned every time we move to the next page,
// to create the illusion that nodes are continuing from page
// to page.
//
// The transition can be customized by setting a Continuation rule,
// which lets you add classes to the original and cloned element
// to customize styling.

const breadcrumbCloner = (rules) => {
  // METHODS
  const markAsContinues = (node) => {
    node.classList.add(c('continues'));
    rules
      .filter(rule => rule.customContinuesClass)
      .forEach(rule => node.classList.add(rule.customContinuesClass));
  };

  const markAsContinuation = (node) => {
    node.classList.add(c('continuation'));
    rules
      .filter(rule => rule.customContinuationClass)
      .forEach(rule => node.classList.add(rule.customContinuationClass));
  };

  return (origBreadcrumb) => {
    const newBreadcrumb = [];

    for (let i = origBreadcrumb.length - 1; i >= 0; i -= 1) {
      const original = origBreadcrumb[i];
      const clone = original.cloneNode(false); // shallow
      clone.innerHTML = '';

      markAsContinues(original);
      markAsContinuation(clone);

      // Special case for IDs
      if (clone.id) {
        // console.warn(`Bindery: Added a break to ${elToStr(clone)},
        // so "${clone.id}" is no longer a unique ID.`);
      }

      // Special case for ordered lists
      if (clone.tagName === 'OL') {
        // restart numbering
        let prevStart = 1;
        if (original.hasAttribute('start')) {
          // the OL is also a continuation
          prevStart = parseInt(original.getAttribute('start'), 10);
        }
        if (i < origBreadcrumb.length - 1 && origBreadcrumb[i + 1].tagName === 'LI') {
          // the first list item is a continuation
          prevStart -= 1;
        }
        const prevCount = original.children.length;
        const newStart = prevStart + prevCount;
        clone.setAttribute('start', newStart);
      }

      if (i < origBreadcrumb.length - 1) clone.appendChild(newBreadcrumb[i + 1]);
      newBreadcrumb[i] = clone;
    }

    return newBreadcrumb;
  };
};

export default breadcrumbCloner;
