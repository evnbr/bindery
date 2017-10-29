import h from 'hyperscript';

// Utils
import elToStr from '../utils/elementToString';
import c from '../utils/prefixClass';
import { last } from '../utils';

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

const paginate = ({ content, rules, success, progress, error }) => {
  // SETUP
  const startLayoutTime = window.performance.now();
  let layoutWaitingTime = 0;

  // const scheduler = new Scheduler(isDebugging);
  const ruleSet = new RuleSet(rules);
  const measureArea = document.body.appendChild(h(c('.measure-area')));

  let breadcrumb = []; // Keep track of position in original tree
  const book = new Book();

  let updatePaginationProgress;
  let finishPagination;

  const currentFlowElement = () => last(breadcrumb);
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
        error('Moved to new page when last one is still overflowing');
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
      error('Maximum page count exceeded');
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }

    finishPage(book.pageInProgress, ignoreOverflow);

    breadcrumb = breadcrumbClone(breadcrumb, rules);
    const newPage = makeNewPage();

    book.pageInProgress = newPage;
    updatePaginationProgress(); // finished with this page, can display

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

  const addTextChild = (parent, child, next) => {
    const addTextWithoutChecks = () => {
      last(breadcrumb).appendChild(child);
      if (canSplit()) {
        book.pageInProgress.suppressErrors = true;
        continueOnNewPage();
      }
      scheduler.throttle(next);
    };

    if (isSplittable(parent, ruleSet.selectorsNotToSplit) && !shouldIgnoreOverflow(parent)) {
      let failure;
      let continueText;
      const addText = (text) => {
        addTextNodeIncremental(
          text, last(breadcrumb), book.pageInProgress, next, failure, continueText
        );
      };
      continueText = (remainingTextNode) => {
        continueOnNewPage();
        addText(remainingTextNode);
      };
      failure = () => {
        if (breadcrumb.length > 1) {
          moveElementToNextPage(parent);
          scheduler.throttle(() =>
            addTextNodeIncremental(
              child,
              last(breadcrumb),
              book.pageInProgress,
              next,
              addTextWithoutChecks,
              continueText
            )
          );
        } else {
          addTextWithoutChecks();
        }
      };
      addText(child);
    } else {
      const failure = () => {
        if (canSplit()) {
          moveElementToNextPage(parent);
        }
        scheduler.throttle(() =>
          addTextNode(child, last(breadcrumb), book.pageInProgress, next, addTextWithoutChecks)
        );
      };
      addTextNode(child, last(breadcrumb), book.pageInProgress, next, failure);
    }
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = (elementToAdd, doneCallback) => {
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
    if (book.pageInProgress.hasOverflowed()) {
      if (canSplit()) {
        moveElementToNextPage(element);
      }
    }

    let index = 0;
    const addNext = () => {
      if (!(index < childNodes.length)) {
        // We're now done with this element and its children,
        // so we pop up a level
        const addedChild = breadcrumb.pop();
        ruleSet.afterAddElement(
          addedChild,
          book,
          continueOnNewPage,
          makeNewPage,
          currentFlowElement
        );

        // if (book.pageInProgress.hasOverflowed()) {
          // console.log('Bindery: Added element despite overflowing');
        // }

        doneCallback();
        return;
      }
      const child = childNodes[index];
      index += 1;

      if (child.nodeType === Node.TEXT_NODE) {
        addTextChild(element, child, addNext);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SCRIPT') {
        if (child.tagName === 'IMG' && !child.naturalWidth) {
          const waitForImageStart = performance.now();
          waitForImage(child, () => {
            const waitForImageTime = performance.now() - waitForImageStart;
            layoutWaitingTime += waitForImageTime;
            addElementNode(child, addNext);
          });
        } else {
          scheduler.throttle(() => addElementNode(child, addNext));
        }
      } else {
        addNext(); // Skip comments and unknown nodes
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
  updatePaginationProgress = () => {
    progress(book);
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

    success(book);
  };
  startPagination();
};

export default paginate;