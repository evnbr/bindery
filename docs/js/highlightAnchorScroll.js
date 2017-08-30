const anchors = Array.from(document.querySelectorAll('h3, h4, h5'));
let currentAnchor;

const updateAnchor = () => {
  const scrollPos = document.scrollingElement.scrollTop;
  const inview = anchors.find(el => el.offsetTop > scrollPos);
  const newAnchor = document.querySelector(`[href='#${inview.id}']`);
  if (newAnchor && newAnchor !== currentAnchor) {
    if (currentAnchor) currentAnchor.classList.remove('selected');
    newAnchor.classList.add('selected');
    currentAnchor = newAnchor;
  }
  if (scrollPos > 10) {
    document.body.classList.add('docs-scrolled');
  } else {
    document.body.classList.remove('docs-scrolled');
  }
};
updateAnchor();
let throttle;
window.addEventListener('scroll', () => {
  if (!throttle) {
    throttle = setTimeout(() => {
      clearTimeout(throttle);
      throttle = null;
      updateAnchor();
    }, 50);
  }
});
