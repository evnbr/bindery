import { Page } from '../book';

const annotatePages = (pages: Page[], offset: number) => {
  // ———
  // NUMBERING

  // TODO: Pass in facingpages options
  const facingPages = true;
  if (facingPages) {
    pages.forEach((page, i) => {
      page.number = offset + i + 1;
      page.setLeftRight((i % 2 === 0) ? 'right' : 'left');
    });
  } else {
    pages.forEach((page) => { page.setLeftRight('right'); });
  }

  // ———
  // RUNNING HEADERS

  // Sections to annotate with.
  // This should be a hierarchical list of selectors.
  // Every time one is selected, it annotates all following pages
  // and clears any subselectors.
  // TODO: Make this configurable
  const headers = { h1: '', h2: '', h3: '', h4: '', h5: '', h6: '' };
  const headingKeys = Object.keys(headers) as (keyof typeof headers)[];

  pages.forEach((page) => {
    page.heading = {};
    headingKeys.forEach((tagName, i) => {
      const element = page.element.querySelector(tagName);
      if (element && element.textContent) {
        headers[tagName] = element.textContent;
        
        // clear remainder
        headingKeys.forEach((tag, j) => {
          if (j > i) headers[tag] = '';
        });
      }
      if (headers[tagName] !== '') {
        page.heading[tagName] = headers[tagName];
      }
    });
  });
};

export default annotatePages;
