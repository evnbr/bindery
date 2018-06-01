const annotatePages = (pages) => {
  // ———
  // NUMBERING

  // TODO: Pass in facingpages options
  const facingPages = true;
  if (facingPages) {
    pages.forEach((page, i) => {
      page.number = i + 1;
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
  const running = { h1: '', h2: '', h3: '', h4: '', h5: '', h6: '' };

  pages.forEach((page) => {
    page.heading = {};
    Object.keys(running).forEach((tagName, i) => {
      const element = page.element.querySelector(tagName);
      if (element) {
        running[tagName] = element.textContent;
        // clear remainder
        Object.keys(running).forEach((tag, j) => {
          if (j > i) running[tag] = '';
        });
      }
      if (running[tagName] !== '') {
        page.heading[tagName] = running[tagName];
      }
    });
  });
};

export default annotatePages;
