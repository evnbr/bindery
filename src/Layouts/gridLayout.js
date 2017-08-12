import h from 'hyperscript';
import c from '../utils/prefixClass';

const twoPageSpread = function (...arg) {
  return h(c('.spread-wrapper') + c('.two-page-size'), ...arg);
};
const onePageSpread = function (...arg) {
  return h(c('.spread-wrapper') + c('.page-size'), ...arg);
};


const renderGridLayout = (pages, isTwoUp) => {
  const gridLayout = document.createDocumentFragment();
  if (isTwoUp) {
    for (let i = 0; i < pages.length; i += 2) {
      const wrap = twoPageSpread(
        pages[i].element, pages[i + 1].element
      );
      gridLayout.appendChild(wrap);
    }
  } else {
    pages.forEach((pg) => {
      const wrap = onePageSpread(pg.element);
      gridLayout.appendChild(wrap);
    });
  }

  return gridLayout;
};

export default renderGridLayout;
