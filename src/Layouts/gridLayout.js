import h from 'hyperscript';
import c from '../utils/prefixClass';
import Page from '../Page';

const spread = function (...arg) {
  return h(c('.spread-wrapper'), ...arg);
};

const renderGridLayout = (pages, isTwoUp) => {
  const gridLayout = document.createDocumentFragment();
  if (isTwoUp) {
    for (let i = 0; i < pages.length; i += 2) {
      const wrap = spread(
        { style: Page.spreadSizeStyle() },
        pages[i].element, pages[i + 1].element
      );
      gridLayout.appendChild(wrap);
    }
  } else {
    pages.forEach((pg) => {
      const wrap = spread({ style: Page.sizeStyle() }, pg.element);
      gridLayout.appendChild(wrap);
    });
  }

  return gridLayout;
};

export default renderGridLayout;
