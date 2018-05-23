import { createEl } from '../../dom-utils';

const twoPageSpread = children => createEl('.spread-wrapper.spread-size', children);
const onePageSpread = children => createEl('.spread-wrapper.page-size', children);

const renderGridLayout = (pages, isTwoUp) => {
  const gridLayout = document.createDocumentFragment();
  if (isTwoUp) {
    for (let i = 0; i < pages.length; i += 2) {
      const wrap = twoPageSpread([pages[i].element, pages[i + 1].element]);
      gridLayout.appendChild(wrap);
    }
  } else {
    pages.forEach((pg) => {
      const wrap = onePageSpread([pg.element]);
      gridLayout.appendChild(wrap);
    });
  }

  return gridLayout;
};

export default renderGridLayout;
