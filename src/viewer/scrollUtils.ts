export const getScrollAsPercent = () => {
  if (!document || !document.scrollingElement) return 0;
  const el = document.scrollingElement;
  return el.scrollTop / el.scrollHeight;
};

export const scrollToPercent = (newVal: number) => {
  if (!document.scrollingElement) return;
  const el = document.scrollingElement;
  el.scrollTop = el.scrollHeight * newVal;
};

export const scrollToBottom = () => {
  const scroll = document.scrollingElement as HTMLElement;
  if (!scroll) return;
  const scrollMax = scroll.scrollHeight - scroll.offsetHeight;
  scroll.scrollTop = scrollMax;
};
