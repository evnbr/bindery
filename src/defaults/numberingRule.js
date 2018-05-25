import rules from '../rules';

const { Split } = rules;


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

export default Split({
  selector: 'ol',
  didSplit: preserveNumbering,
});
