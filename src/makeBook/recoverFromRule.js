// TODO:
// While this does catch overflows, it is pretty hacky to move the entire node to the next page.
// - 1. there is no guarentee it will fit on the new page
// - 2. if it had childNodes, those side effects will not be undone,
// which means footnotes will get left on previous page.
// - 3. if it is a large paragraph, it will leave a large gap. the
// ideal approach would be to only need to invalidate the last line of text.
const recoverFromRule = (el, book, nextBox) => {
  let removed = el;
  const parent = el.parentNode;
  parent.removeChild(removed);
  let popped;
  if (book.currentPage.hasOverflowed()) {
    parent.appendChild(el);
    removed = parent;
    removed.parentNode.removeChild(removed);
    popped = book.currentPage.flow.path.pop();
    if (book.currentPage.hasOverflowed()) {
      console.error('Trying again didnt fix it');
    } else {
      // Trying again worked
    }
  }
  const newBox = nextBox();
  newBox.currentElement.appendChild(removed);
  if (popped) newBox.path.push(popped);
};


export default recoverFromRule;
