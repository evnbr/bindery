import h from 'hyperscript';

// Bindery
import Book from '../Book';
import Page from '../Page';
import scheduler from '../Scheduler';

// paginate
import shouldIgnoreOverflow from './shouldIgnoreOverflow';
import { addTextNodeIncremental, addTextNode } from './addTextNode';
import RuleSet from './RuleSet';
import orderPages from './orderPages';
import annotatePages from './annotatePages';
import breadcrumbClone from './breadcrumbClone';
import waitForImage from './waitForImage';

// Utils
import elToStr from '../utils/elementToString';
import { c, last } from '../utils';
import Thenable from './Thenable';

const MAXIMUM_PAGE_LIMIT = 1500;

// Walk up the tree to see if we can safely
// insert a split into this node.
const isSplittable = (element, selectorsNotToSplit) => {
  if (selectorsNotToSplit.some(sel => element.matches(sel))) {
    if (element.hasAttribute('data-bindery-did-move')
      || element.classList.contains(c('continuation'))) {
      return true; // ignore rules and split it anyways.
    }
    return false;
  }
  if (element.parentElement) {
    return isSplittable(element.parentElement, selectorsNotToSplit);
  }
  return true;
};

const paginate = (content, rules) => {
  const bookComplete = new Thenable();
  // SETUP
  const startLayoutTime = window.performance.now();
  let layoutWaitingTime = 0;
  const ruleSet = new RuleSet(rules);
  const measureArea = document.body.appendChild(h(c('.measure-area')));

  let breadcrumb = []; // Keep track of position in original tree
  const book = new Book();

  let finishPagination;

  const canSplit = () => !shouldIgnoreOverflow(last(breadcrumb));

  const makeNewPage = () => {
    const newPage = new Page();
    measureArea.appendChild(newPage.element);

    ruleSet.startPage(newPage, book);
    return newPage;
  };

  const finishPage = (page, ignoreOverflow) => {
    if (page && page.hasOverflowed()) {
      console.warn('Bindery: Page overflowing', book.pageInProgress.element);
      if (!page.suppressErrors && !ignoreOverflow) {
        bookComplete.reject('Moved to new page when last one is still overflowing');
        throw Error('Bindery: Moved to new page when last one is still overflowing');
      }
    }

    // finished with this page, can display
    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);
    if (page) ruleSet.finishPage(page, book);
  };

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  const continueOnNewPage = (ignoreOverflow = false) => {
    if (book.pages.length > MAXIMUM_PAGE_LIMIT) {
      bookComplete.reject('Maximum page count exceeded');
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }

    finishPage(book.pageInProgress, ignoreOverflow);

    breadcrumb = breadcrumbClone(breadcrumb, rules);
    const newPage = makeNewPage();

    book.pageInProgress = newPage;
    bookComplete.updateProgress(book);

    book.pages.push(newPage);

    if (breadcrumb[0]) {
      newPage.flowContent.appendChild(breadcrumb[0]);
    }

    // make sure the cloned page is valid.
    if (newPage.hasOverflowed()) {
      const suspect = last(breadcrumb);
      if (suspect) {
        console.warn(`Bindery: Content overflows, probably due to a style set on ${elToStr(suspect)}.`);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.warn('Bindery: Content overflows.');
      }
    }

    return newPage;
  };

  const moveElementToNextPage = (nodeToMove) => {
    // So this node won't get cloned. TODO: this is unclear
    breadcrumb.pop();

    if (breadcrumb.length < 1) {
      throw Error('Bindery: Attempting to move the top-level element is not allowed');
    }

    // find the nearest splittable parent
    let willMove = nodeToMove;
    const pathToRestore = [];
    while (breadcrumb.length > 1 && !isSplittable(last(breadcrumb), ruleSet.selectorsNotToSplit)) {
      // console.log('Not OK to split:', last(breadcrumb));
      willMove = breadcrumb.pop();
      pathToRestore.unshift(willMove);
    }

    // Once a node is moved to a new page, it should no longer trigger another
    // move. otherwise tall elements will endlessly get shifted to the next page
    willMove.setAttribute('data-bindery-did-move', true);

    const parent = willMove.parentNode;
    parent.removeChild(willMove);

    if (breadcrumb.length > 1 && last(breadcrumb).textContent.trim() === '') {
      parent.appendChild(willMove);
      willMove = breadcrumb.pop();
      pathToRestore.unshift(willMove);
      willMove.parentNode.removeChild(willMove);
    }

    // If the page is empty when this node is removed,
    // then it won't help to move it to the next page.
    // Instead continue here until the node is done.
    if (!book.pageInProgress.isEmpty) {
      if (book.pageInProgress.hasOverflowed()) {
        book.pageInProgress.suppressErrors = true;
      }
      continueOnNewPage();
    }

    // append node as first in new page
    last(breadcrumb).appendChild(willMove);

    // restore subpath
    pathToRestore.forEach((restore) => { breadcrumb.push(restore); });

    breadcrumb.push(nodeToMove);
  };

  const addTextWithoutChecks = (child, parent) => {
    const then = new Thenable();
    parent.appendChild(child);
    if (canSplit()) {
      book.pageInProgress.suppressErrors = true;
      continueOnNewPage();
    }
    then.resolve();
    return then;
  };

  const addSplittableText = (text) => {
    const then = new Thenable();
    addTextNodeIncremental(text, last(breadcrumb), book.pageInProgress)
      .then((remainder) => {
        if (remainder) {
          continueOnNewPage();
          addSplittableText(remainder).then(then.resolve).catch(then.reject);
        } else {
          then.resolve();
        }
      }).catch(then.reject);
    return then;
  };

  const addTextChild = (child, parent) => {
    const then = new Thenable();
    if (isSplittable(parent, ruleSet.selectorsNotToSplit) && !shouldIgnoreOverflow(parent)) {
      addSplittableText(child)
        .catch(() => {
          if (breadcrumb.length > 1) {
            moveElementToNextPage(parent);
            return addSplittableText(child);
          }
          return addTextWithoutChecks(child, last(breadcrumb));
        })
        .catch(() => addTextWithoutChecks(child, last(breadcrumb)))
        .then(then.resolve);
    } else {
      addTextNode(child, last(breadcrumb), book.pageInProgress)
        .catch(() => {
          if (canSplit()) moveElementToNextPage(parent);
          return addTextNode(child, last(breadcrumb), book.pageInProgress);
        })
        .catch(() => addTextWithoutChecks(child, last(breadcrumb)))
        .then(then.resolve);
    }
    return then;
  };

  let addElementNode;
  const addChild = (child, parent, next) => {
    if (child.nodeType === Node.TEXT_NODE) {
      addTextChild(child, parent).then(next);
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SCRIPT') {
      if (child.tagName === 'IMG' && !child.naturalWidth) {
        const imgStart = performance.now();
        waitForImage(child, () => {
          layoutWaitingTime += (performance.now() - imgStart);
          addElementNode(child, next);
        });
      } else {
        scheduler.throttle(() => addElementNode(child, next));
      }
    } else {
      next(); // Skip comments and unknown nodes
    }
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  addElementNode = (elementToAdd, doneCallback) => {
    if (book.pageInProgress.hasOverflowed() && canSplit()) {
      book.pageInProgress.suppressErrors = true;
      continueOnNewPage();
    }
    const element = ruleSet.beforeAddElement(elementToAdd, book, continueOnNewPage, makeNewPage);

    if (!breadcrumb[0]) book.pageInProgress.flowContent.appendChild(element);
    else last(breadcrumb).appendChild(element);

    breadcrumb.push(element);

    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    // Overflows when empty
    if (book.pageInProgress.hasOverflowed() && canSplit()) {
      moveElementToNextPage(element);
    }

    let index = 0;
    const addNext = () => {
      if (index < childNodes.length) {
        const child = childNodes[index];
        index += 1;
        addChild(child, element, addNext);
      } else {
        // We're now done with this element and its children,
        // so we pop up a level
        const addedChild = breadcrumb.pop();
        ruleSet.afterAddElement(
          addedChild,
          book,
          continueOnNewPage,
          makeNewPage,
          () => last(breadcrumb)
        );
        doneCallback();
      }
    };

    // kick it off
    addNext();
  };

  const startPagination = () => {
    ruleSet.setup();
    content.style.margin = 0;
    content.style.padding = 0;
    continueOnNewPage();
    requestAnimationFrame(() => {
      addElementNode(content, finishPagination);
    });
  };
  finishPagination = () => {
    document.body.removeChild(measureArea);

    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);

    book.setCompleted();
    ruleSet.finishEveryPage(book);

    if (!scheduler.isDebugging) {
      const endLayoutTime = window.performance.now();
      const totalTime = endLayoutTime - startLayoutTime;
      const layoutTime = totalTime - layoutWaitingTime;
      console.log(`📖 Book ready in ${(totalTime / 1000).toFixed(2)}s (Layout: ${(layoutTime / 1000).toFixed(2)}s, Waiting for images: ${(layoutWaitingTime / 1000).toFixed(2)}s)`);
    }

    bookComplete.resolve(book);
  };
  startPagination();
  return bookComplete;
};

export default paginate;
