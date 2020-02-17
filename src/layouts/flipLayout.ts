import { Page } from '../book';
import { c, createEl } from '../dom-utils';
import padPages from './padPages';

const renderFlipLayout = (bookPages: Page[], doubleSided: boolean) => {
  const pages = padPages(bookPages, () => new Page());

  const flipLayout = document.createDocumentFragment();
  const sizer = createEl('.spread-size.flip-sizer');
  const flapHolder = createEl('.spread-size.flap-holder');
  sizer.appendChild(flapHolder);
  flipLayout.appendChild(sizer);

  const flaps: HTMLElement[] = [];

  let currentLeaf = -1;

  let leftOffset = 4;
  if (pages.length * leftOffset > 60) {
    leftOffset = 60 / pages.length;
  }
  flapHolder.style.width = `${pages.length * leftOffset}px`;

  const setLeaf = (n: number) => {
    let newLeaf = n;
    if (newLeaf === currentLeaf) newLeaf += 1;
    currentLeaf = newLeaf;

    let zScale = 4;
    if (flaps.length * zScale > 200) zScale = 200 / flaps.length;

    flaps.forEach((flap, i, arr) => {
      // + 0.5 so left and right are even
      const z = (arr.length - Math.abs((i - newLeaf) + 0.5)) * zScale;
      flap.style.transform = `translate3d(${(i < newLeaf) ? 4 : 0}px,0,${z}px) rotateY(${(i < newLeaf) ? -180 : 0}deg)`;
    });
  };

  let leafIndex = 0;
  for (let i = 1; i < pages.length - 1; i += (doubleSided ? 2 : 1)) {
    leafIndex += 1;
    const li = leafIndex;
    const flap = createEl('.page3d');
    flap.addEventListener('click', () => {
      const newLeaf = li - 1;
      setLeaf(newLeaf);
    });

    const rightPage = pages[i].element;
    let leftPage;
    rightPage.classList.add(c('page3d-front'));
    flap.appendChild(rightPage);
    if (doubleSided) {
      flap.classList.add(c('doubleSided'));
      leftPage = pages[i + 1].element;
    } else {
      leftPage = createEl('.page');
    }
    leftPage.classList.add(c('page3d-back'));
    flap.appendChild(leftPage);

    // TODO: Dynamically add/remove pages.
    // Putting 1000s of elements onscreen
    // locks up the browser.

    flap.style.left = `${i * leftOffset}px`;

    flaps.push(flap);
    flapHolder.appendChild(flap);
  }

  setLeaf(0);
  return flipLayout;
};

export default renderFlipLayout;
