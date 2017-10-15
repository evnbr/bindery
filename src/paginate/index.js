import h from 'hyperscript';

// Utils
import elToStr from '../utils/elementToString';
import c from '../utils/prefixClass';
import { last } from '../utils';

// Bindery
import Book from '../Book';
import Page from '../Page';

// paginate
import Scheduler from './Scheduler';
import orderPages from './orderPages';
import annotatePages from './annotatePages';
import breadcrumbCloner from './breadcrumbCloner';
import waitForImage from './waitForImage';

const MAXIMUM_PAGE_LIMIT = 9999;

const paginate = ({ content, rules, success, progress, error, isDebugging }) => {
  // SETUP
  const startLayoutTime = window.performance.now();
  let layoutWaitingTime = 0;
  const scheduler = new Scheduler(isDebugging);
  const cloneBreadcrumb = breadcrumbCloner(rules);
  const measureArea = document.body.appendChild(h(c('.measure-area')));

  let breadcrumb = []; // Keep track of position in original tree
  const book = new Book();

  let updatePaginationProgress;
  let finishPagination;

  const currentFlowElement = function () {
    return breadcrumb[0]
      ? last(breadcrumb)
      : book.pageInProgress.flowContent;
  };

  const applyNewPageRules = (pg) => {
    rules.forEach((rule) => {
      if (rule.afterPageCreated) rule.afterPageCreated(pg, book);
    });
  };

  const applyLayoutStartRules = () => {
    rules.forEach((rule) => {
      if (rule.layoutStart) rule.layoutStart();
    });
  };

  const makeNewPage = () => {
    const newPage = new Page();
    measureArea.appendChild(newPage.element);

    applyNewPageRules(newPage);
    return newPage;
  };

  const finishPage = () => {
    // finished with this page, can display
    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);
    if (book.pageInProgress) {
      applyPageRules(book.pageInProgress);
    }
  };

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  const continueOnNewPage = () => {
    if (book.pageInProgress && book.pageInProgress.hasOverflowed()) {
      console.warn('Bindery: Page overflowing', book.pageInProgress.element);
      if (!book.pageInProgress.suppressErrors) {
        error('Moved to new page when last one is still overflowing');
        throw Error('Bindery: Moved to new page when last one is still overflowing');
      }
    }

    if (book.pages.length === 500) {
      console.warn('Bindery: More than 500 pages, performance may be slow.');
    } else if (book.pages.length === 1000) {
      console.warn('Bindery: More than 1000 pages, performance may be slow.');
    } else if (book.pages.length > MAXIMUM_PAGE_LIMIT) {
      error('Maximum page count exceeded');
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }

    finishPage();

    breadcrumb = cloneBreadcrumb(breadcrumb);
    const newPage = makeNewPage();

    book.pageInProgress = newPage;
    updatePaginationProgress(); // finished with this page, can display

    book.pages.push(newPage);

    if (breadcrumb[0]) {
      newPage.flowContent.appendChild(breadcrumb[0]);
    }

    // make sure the cloned page is valid.
    if (newPage.hasOverflowed()) {
      const suspect = currentFlowElement();
      if (suspect) {
        console.error(`Bindery: NextPage already overflowing, probably due to a style set on ${elToStr(suspect)}. It may not fit on the page.`);
        suspect.parentNode.removeChild(suspect);
      } else {
        console.error('Bindery: NextPage already overflowing.');
      }
    }

    return newPage;
  };

  const beforeAddRules = rules.filter(r => r.selector && r.beforeAdd);
  const afterAddRules = rules.filter(r => r.selector && r.afterAdd);
  const pageRules = rules.filter(r => r.eachPage);
  const selectorsNotToSplit = rules.filter(rule => rule.avoidSplit).map(rule => rule.selector);

  const conflictingNames = ['FullBleedPage', 'FullBleedSpread', 'PageBreak'];
  const dedupeRules = (inputRules) => {
    const conflictRules = inputRules.filter(rule =>
      conflictingNames.includes(rule.constructor.name));
    const uniqueRules = inputRules.filter(rule => !conflictRules.includes(rule));

    const firstSpreadRule = conflictRules.find(rule => rule.constructor.name === 'FullBleedSpread');
    const firstPageRule = conflictRules.find(rule => rule.constructor.name === 'FullBleedPage');

    // Only apply one
    if (firstSpreadRule) uniqueRules.push(firstSpreadRule);
    else if (firstPageRule) uniqueRules.push(firstPageRule);
    else { // multiple pagebreaks are ok
      uniqueRules.push(...conflictRules);
    }

    return uniqueRules;
  };

  const applyBeforeAddRules = (element) => {
    let addedElement = element;

    const matchingRules = beforeAddRules.filter(rule => addedElement.matches(rule.selector));
    // const uniqueRules = dedupeRules(matchingRules);

    matchingRules.forEach((rule) => {
      addedElement = rule.beforeAdd(addedElement, book, continueOnNewPage, makeNewPage);
    });
    return addedElement;
  };

  const applyAfterAddRules = (originalElement) => {
    let addedElement = originalElement;

    const matchingRules = afterAddRules.filter(rule => addedElement.matches(rule.selector));
    const uniqueRules = dedupeRules(matchingRules);

    uniqueRules.forEach((rule) => {
      addedElement = rule.afterAdd(
        addedElement,
        book,
        continueOnNewPage,
        makeNewPage,
        function overflowCallback(problemElement) {
          // TODO:
          // While this does catch overflows, it introduces a few new bugs.
          // It is pretty aggressive to move the entire node to the next page.
          // - 1. there is no guarentee it will fit on the new page
          // - 2. if it has childNodes, those side effects will not be undone,
          // which means footnotes will get left on previous page.
          // - 3. if it is a large paragraph, it will leave a large gap. the
          // ideal approach would be to only need to invalidate
          // the last line of text.
          problemElement.parentNode.removeChild(problemElement);
          continueOnNewPage();
          currentFlowElement().appendChild(problemElement);
          return rule.afterAdd(
            problemElement,
            book,
            continueOnNewPage,
            makeNewPage,
            () => {
              console.log(`Couldn't apply ${rule.name} to ${elToStr(problemElement)}. Caused overflows twice.`);
            }
          );
        }
      );
    });
    return addedElement;
  };

  const applyEachPageRules = () => {
    pageRules.forEach((rule) => {
      book.pages.forEach((page) => {
        rule.eachPage(page, book);
      });
    });
  };

  const applyPageRules = (page) => {
    pageRules.forEach((rule) => {
      rule.eachPage(page, book);
    });
  };

  // Walk up the tree to see if we can safely
  // insert a split into this node.
  const isSplittable = (node) => {
    if (selectorsNotToSplit.some(sel => node.matches(sel))) {
      if (node.hasAttribute('data-bindery-did-move')
        || node.classList.contains(c('continuation'))) {
        return true; // don't split it again.
      }
      return false;
    }
    if (node.parentElement) {
      return isSplittable(node.parentElement);
    }
    return true;
  };

  // Walk up the tree to see if we are within
  // an overflow-ignoring node
  const shouldIgnoreOverflow = (node) => {
    if (node.hasAttribute('data-ignore-overflow')) return true;
    if (node.parentElement) return shouldIgnoreOverflow(node.parentElement);
    return false;
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
    while (breadcrumb.length > 1 && !isSplittable(currentFlowElement())) {
      // console.log('Not OK to split:', currentFlowElement());
      willMove = breadcrumb.pop();
      pathToRestore.unshift(willMove);
    }

    // Once a node is moved to a new page, it should no longer trigger another
    // move. otherwise tall elements will endlessly get shifted to the next page
    willMove.setAttribute('data-bindery-did-move', true);

    const parent = willMove.parentNode;
    parent.removeChild(willMove);

    if (breadcrumb.length > 1 && currentFlowElement().textContent.trim() === '') {
      parent.appendChild(willMove);
      willMove = breadcrumb.pop();
      pathToRestore.unshift(willMove);
      willMove.parentNode.removeChild(willMove);
    }

    if (book.pageInProgress.isEmpty) {
      // Fail to move to next page, instead continue here
      nodeToMove.setAttribute('data-ignore-overflow', true);
    } else {
      if (book.pageInProgress.hasOverflowed()) {
        book.pageInProgress.suppressErrors = true;
      }
      continueOnNewPage();
    }

    // append node as first in new page
    currentFlowElement().appendChild(willMove);

    // restore subpath
    pathToRestore.forEach((restore) => {
      breadcrumb.push(restore);
    });

    // TODO: Confusing. If we didn't pop this node above, we don't
    // need to push it back again.
    breadcrumb.push(nodeToMove);
  };

  const addTextNode = (textNode, doneCallback, failure) => {
    currentFlowElement().appendChild(textNode);

    if (book.pageInProgress.hasOverflowed()) {
      textNode.parentNode.removeChild(textNode);
      failure();
    } else {
      scheduler.throttle(doneCallback);
    }
  };

  // Adds an text node by incrementally adding words
  // until it just barely doesnt overflow
  const addTextNodeIncremental = (textNode, doneCallback, failure) => {
    const originalText = textNode.nodeValue;
    currentFlowElement().appendChild(textNode);

    if (!book.pageInProgress.hasOverflowed()) {
      scheduler.throttle(doneCallback);
      return;
    }
    if (currentFlowElement().hasAttribute('data-ignore-overflow')) {
      scheduler.throttle(doneCallback);
      return;
    }

    let pos = 0;

    // Must be in viewport for caretRangeFromPoint
    // measureArea.appendChild(book.pageInProgress.element);
    //
    // const flowBoxPos = book.pageInProgress.flowBox.getBoundingClientRect();
    // const endX = flowBoxPos.left + flowBoxPos.width - 1;
    // const endY = flowBoxPos.top + flowBoxPos.height - 30; // TODO: Real line height
    // const range = document.caretRangeFromPoint(endX, endY);
    // if (range && range.startContainer === textNode) {
    //   console.log(`Predicted ${range.startOffset}: ${originalText.substr(0, range.startOffset)}`);
    //   pos = range.startOffset;
    // }

    const splitTextStep = () => {
      textNode.nodeValue = originalText.substr(0, pos);

      if (book.pageInProgress.hasOverflowed()) {
        // Back out to word boundary
        if (originalText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
        while (originalText.charAt(pos) !== ' ' && pos > 0) pos -= 1;

        if (pos < 1) {
          textNode.nodeValue = originalText;
          textNode.parentNode.removeChild(textNode);
          failure();
          return;
        }

        // console.log(`Text breaks at ${pos}: ${originalText.substr(0, pos)}`);

        const fittingText = originalText.substr(0, pos);
        const overflowingText = originalText.substr(pos);
        textNode.nodeValue = fittingText;

        // Start on new page
        continueOnNewPage();
        const remainingTextNode = document.createTextNode(overflowingText);
        addTextNodeIncremental(remainingTextNode, doneCallback, failure);
        return;
      }
      if (pos > originalText.length - 1) {
        scheduler.throttle(doneCallback);
        return;
      }

      pos += 1;
      while (originalText.charAt(pos) !== ' ' && pos < originalText.length) pos += 1;

      scheduler.throttle(splitTextStep);
    };

    splitTextStep();
  };

  const addTextChild = (parent, child, next) => {
    const forceAddTextNode = () => {
      currentFlowElement().appendChild(child);
      if (!shouldIgnoreOverflow(currentFlowElement())) {
        book.pageInProgress.suppressErrors = true;
        continueOnNewPage();
      }
      scheduler.throttle(next);
    };

    if (isSplittable(parent)) {
      const failure = () => {
        if (breadcrumb.length > 1) {
          moveElementToNextPage(parent);
          scheduler.throttle(() => addTextNodeIncremental(child, next, forceAddTextNode));
        } else {
          forceAddTextNode();
        }
      };
      addTextNodeIncremental(child, next, failure);
    } else {
      const failure = () => {
        if (!shouldIgnoreOverflow(currentFlowElement())) {
          moveElementToNextPage(parent);
        }
        scheduler.throttle(() => addTextNode(child, next, forceAddTextNode));
      };
      addTextNode(child, next, failure);
    }
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  const addElementNode = (elementToAdd, doneCallback) => {
    if (book.pageInProgress.hasOverflowed()) {
      if (currentFlowElement().hasAttribute('data-ignore-overflow')) {
        // Do nothing. We just have to add nodes despite the page overflowing.
      } else {
        book.pageInProgress.suppressErrors = true;
        continueOnNewPage();
      }
    }
    const element = applyBeforeAddRules(elementToAdd);

    currentFlowElement().appendChild(element);

    breadcrumb.push(element);

    const childNodes = [...element.childNodes];
    element.innerHTML = '';

    // Overflows when empty
    if (book.pageInProgress.hasOverflowed()) {
      if (shouldIgnoreOverflow(currentFlowElement())) {
        //
      } else {
        moveElementToNextPage(element);
      }
    }

    let index = 0;
    const addNext = () => {
      if (!(index < childNodes.length)) {
        // We're now done with this element and its children,
        // so we pop up a level
        const addedChild = breadcrumb.pop();
        applyAfterAddRules(addedChild);

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
      } else if (child.nodeType === Node.ELEMENT_NODE
        && child.tagName !== 'SCRIPT') {
        if (child.tagName === 'IMG' && !child.naturalWidth) {
          const waitForImageStart = performance.now();
          waitForImage(child, () => {
            const waitForImageTime = performance.now() - waitForImageStart;
            layoutWaitingTime += waitForImageTime;
            addElementNode(child, addNext);
          });
        } else {
          scheduler.throttle(() => {
            addElementNode(child, addNext);
          });
        }
      } else {
        addNext(); // Skip comments and unknown nodes
      }
    };
    // kick it off
    addNext();
  };

  const startPagination = () => {
    applyLayoutStartRules();
    content.style.margin = 0;
    content.style.padding = 0;
    continueOnNewPage();
    scheduler.throttle(() => {
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
    applyEachPageRules();

    if (!isDebugging) {
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
