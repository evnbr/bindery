import Page from '../Page';

const padPages = (pages) => {
  if (pages.length % 2 !== 0) {
    const pg = new Page();
    pages.push(pg);
  }
  const spacerPage = new Page();
  const spacerPage2 = new Page();
  spacerPage.element.style.visibility = 'hidden';
  spacerPage2.element.style.visibility = 'hidden';
  pages.unshift(spacerPage);
  pages.push(spacerPage2);

  return pages;
};

export default padPages;
