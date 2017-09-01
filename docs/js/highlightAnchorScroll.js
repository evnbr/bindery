(function highlightAnchorScroll() {
  const anchors = Array.from(document.querySelectorAll('h3, h4, h5'));
  let currentAnchor;
  let throttleScroll;

  // eslint-disable-next-line no-confusing-arrow
  const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + ((4 - (2 * t)) * t);
  const scrollToAnchor = (anchor) => {
    const scroller = document.scrollingElement;
    const start = scroller.scrollTop;
    const end = anchor.length > 1 ? document.querySelector(anchor).offsetTop - 40 : 0;
    const dist = end - start;
    let t = 0;
    const step = () => {
      scroller.scrollTop = start + (easeInOutQuad(t) * dist);
      t += 0.08;
      if (t < 1) requestAnimationFrame(step);
      else scroller.scrollTop = end;
    };
    step();
  };

  const updateAnchor = () => {
    const scrollPos = document.scrollingElement.scrollTop;
    const inview = anchors.find(el => el.offsetTop > scrollPos);
    if (inview) {
      const newAnchor = document.querySelector(`[href='#${inview.id}']`);
      if (newAnchor && newAnchor !== currentAnchor) {
        if (currentAnchor) currentAnchor.classList.remove('selected');
        newAnchor.classList.add('selected');
        currentAnchor = newAnchor;
      }
    }
    if (scrollPos > 10) {
      document.body.classList.add('docs-scrolled');
    } else {
      document.body.classList.remove('docs-scrolled');
    }
  };
  updateAnchor();

  [...document.querySelectorAll('a')]
    .filter(a => a.getAttribute('href')[0] === '#')
    .forEach((a) => {
      // a.addEventListener('click', updateAnchor);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToAnchor(a.getAttribute('href'));
      });
    });

  window.addEventListener('scroll', () => {
    if (!throttleScroll) {
      throttleScroll = setTimeout(() => {
        clearTimeout(throttleScroll);
        throttleScroll = null;
        updateAnchor();
      }, 50);
    }
  });
}());
