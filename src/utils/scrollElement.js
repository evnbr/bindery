
// eslint-disable-next-line no-confusing-arrow
const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + ((4 - (2 * t)) * t);

const scrollPct = el => (el.scrollTop + el.offsetHeight) / el.scrollHeight;

const scrollToBottom = (el) => {
  const start = el.scrollTop;
  const end = el.scrollHeight;
  const dist = end - start;
  let t = 0;
  const step = () => {
    el.scrollTop = start + (easeInOutQuad(t) * dist);
    t += 0.05;
    if (t < 1) requestAnimationFrame(step);
  };
  step();
};

export { scrollToBottom, scrollPct };
