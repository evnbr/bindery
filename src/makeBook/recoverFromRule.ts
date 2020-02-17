import { Book, PageMaker } from "../book";
import { RegionGetter } from "regionize/dist/types/types";

// TODO:
// While this does catch overflows, it is pretty hacky to move the entire node to the next page.
// - 1. there is no guarentee it will fit on the new page
// - 2. if it had childNodes, those side effects will not be undone,
// which means footnotes will get left on previous page.
// - 3. if it is a large paragraph, it will leave a large gap. the
// ideal approach would be to only need to invalidate the last line of text.
const recoverFromRule = (el: HTMLElement, book: Book, nextRegion: RegionGetter) => {
  let removed = el;
  const parent = el.parentNode as HTMLElement;
  if (!parent) {
    throw Error("Can't recoverFromRule when element is unparented");
  }
  parent.removeChild(removed);
  let popped;
  if (book.currentPage.hasOverflowed()) {
    parent.appendChild(el);
    removed = parent;
    if (!removed.parentNode) {
      throw Error("Can't recoverFromRule when element is unparented");
    }
    removed.parentNode.removeChild(removed);
    popped = book.currentPage.flow.path.pop();
    if (book.currentPage.hasOverflowed()) {
      console.error('Trying again didnt fix it');
    } else {
      // Trying again worked
    }
  }
  const newRegion = nextRegion();
  newRegion.currentElement.appendChild(removed);
  if (popped) newRegion.path.push(popped);
};


export default recoverFromRule;
