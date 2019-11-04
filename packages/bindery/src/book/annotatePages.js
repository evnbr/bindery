const annotatePages = (pages, offset) => {
  // ———
  // NUMBERING

  // TODO: Pass in facingpages options
  const facingPages = true;
  if (facingPages) {
    pages.forEach((page, i) => {
      page.setState({
        number: offset + i + 1,
        side: (i % 2 === 0) ? 'right' : 'left',
      });
    });
  } else {
    pages.forEach((page) => {
      page.setState({
        side: 'right',
      });
    });
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
    const currentHeadings = {};
    Object.keys(running).forEach((tagName, i) => {
      const element = page.getElementWithAllPendingUpdates().querySelector(tagName);
      if (element) {
        running[tagName] = element.textContent;
        // clear remainder
        Object.keys(running).forEach((tag, j) => {
          if (j > i) running[tag] = '';
        });
      }
      if (running[tagName] !== '') {
        currentHeadings[tagName] = running[tagName];
      }
    });
    page.setState({
      heading: currentHeadings,
    });
  });
};

export default annotatePages;
