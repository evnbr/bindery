import { Page } from '../book';
import { HierarchyEntry } from '../types';

export const annotatePagesNumbers = (pages: Page[], offset: number) => {
  // ———
  // NUMBERING

  // TODO: Pass in facingpages as an option?
  const facingPages = true;
  if (facingPages) {
    pages.forEach((page, i) => {
      page.number = offset + i + 1;
      page.setLeftRight(i % 2 === 0 ? 'right' : 'left');
    });
  } else {
    pages.forEach(page => {
      page.setLeftRight('right');
    });
  }
};

export const annotatePagesHierarchy = (
  pages: Page[],
  headerSelectorHierarchy: string[]
) => {
  // ———
  // RUNNING HEADERS

  // Sections to annotate with.
  // This should be a hierarchical list of selectors.
  // Every time one is selected, it annotates all following pages
  // and clears any subselectors.

  let currentHierarchy: HierarchyEntry[] = [];

  pages.forEach(page => {
    const pageHierarchy: HierarchyEntry[] = [];

    headerSelectorHierarchy.forEach((selector, i) => {
      const element = page.element.querySelector(selector);

      // A new header level starts on this page
      if (element) {
        currentHierarchy[i] = {
          selector: selector,
          text: element.textContent ?? '',
          el: element
        };

        // Clear any lower headers in the hierarchy
        currentHierarchy = currentHierarchy.slice(0, i + 1);

        // headerSelectorHierarchy.forEach((lowerSelector, j) => {
        //   if (j > i) {
        //     currentHeaders[j] = { selector: lowerSelector, text: '', el: undefined };
        //   }
        // });
      }

      // Always decorate this page with current header state.
      if (currentHierarchy[i]) {
        pageHierarchy[i] = currentHierarchy[i];
      }
    });

    page.hierarchy = pageHierarchy;
  });
};

export const annotatePages = (pages: Page[], offset: number) => {
  annotatePagesNumbers(pages, offset);
  annotatePagesHierarchy(pages, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
};
