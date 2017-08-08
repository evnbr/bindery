import h from 'hyperscript';
import c from '../utils/prefixClass';
import Page from '../Page';

const renderFlipLayout = (pages, doubleSided, pageClick) => {
  const flipLayout = document.createDocumentFragment();

  let leafIndex = 0;
  for (let i = 1; i < pages.length - 1; i += (doubleSided ? 2 : 1)) {
    leafIndex += 1;
    const li = leafIndex;
    const flap = h(c('.page3d'), {
      style: Page.sizeStyle(),
      onclick: () => {
        const newLeaf = li - 1;
        pageClick(newLeaf);
      },
    });

    const rightPage = pages[i].element;
    let leftPage;
    rightPage.classList.add(c('page3d-front'));
    flap.appendChild(rightPage);
    if (doubleSided) {
      flap.classList.add(c('doubleSided'));
      leftPage = pages[i + 1].element;
      leftPage.classList.add(c('page3d-back'));
      flap.appendChild(leftPage);
    } else {
      leftPage = h(c('.page') + c('.page3d-back'), {
        style: Page.sizeStyle(),
      });
      flap.appendChild(leftPage);
    }
    // TODO: Dynamically add/remove pages.
    // Putting 1000s of elements onscreen
    // locks up the browser.

    let leftOffset = 4;
    if (pages.length * leftOffset > 300) leftOffset = 300 / pages.length;

    flap.style.left = `${i * leftOffset}px`;

    flipLayout.appendChild(flap);
  }

  return flipLayout;
};

export default renderFlipLayout;
