import { createEl, classes, c } from '../dom-utils';

// TODO: renderPage needs to be called
// after any change to pageInfo that affects
// the size of the flow region. These changes
// need to be flushed before regionize tries
// to measure the element again.
const renderPage = (pageInfo) => {
  const {
    flowRegion,
    isLeft,
    isSpread,
    isSpacer,
    suppress,
    rotation,
    backgroundContent,
    footnoteElements,
    runningHeader,
  } = pageInfo;

  let backgroundEl = createEl('page-background');
  const footerEl = createEl('footer');
  if (backgroundContent) {
    backgroundEl.append(backgroundContent);
    if (rotation && rotation !== 'none') {
      const rotateContainer = createEl(`.rotate-container.page-size-rotated.rotate-${rotation}`);
      rotateContainer.append(backgroundEl);
      backgroundEl = rotateContainer;
    }
  }
  const pg = createEl('page', [
    backgroundEl,
    flowRegion.element,
    footerEl,
  ]);
  if (footnoteElements) {
    footerEl.append(...footnoteElements);
  }
  if (runningHeader) {
    pg.append(runningHeader);
  }
  pg.classList.toggle(classes.leftPage, isLeft);
  pg.classList.toggle(classes.rightPage, !isLeft);
  if (suppress) pg.classList.add(classes.isOverflowing);
  if (isSpread) pg.classList.add(c('spread'));
  if (isSpacer) pg.style.visibility = 'hidden';
  return pg;
};

export default renderPage;
