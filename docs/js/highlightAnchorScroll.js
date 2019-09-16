(function highlightAnchorScroll() {
  const scrollPct = el => (el.scrollTop + el.offsetHeight) / el.scrollHeight;

  // via https://gist.github.com/gre/1650294
  // eslint-disable-next-line no-confusing-arrow
  const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + ((4 - (2 * t)) * t);

  // const anchors = Array.from(document.querySelectorAll('h2, h3, h4, h5'));
  const anchors = Array.from(document.querySelectorAll('h2'));

  let currentAnchor;
  let throttleScroll;

  const scrollToAnchor = (anchor) => {
    history.replaceState(undefined, undefined, `${anchor}`);

    const scroller = document.scrollingElement;
    const start = scroller.scrollTop;
    const end = anchor.length > 1 ? document.querySelector(anchor).offsetTop - 40 : 0;
    const dist = end - start;
    let t = 0;
    const step = () => {
      scroller.scrollTop = start + (easeInOutQuad(t) * dist);
      t += 0.06;
      if (t < 1) requestAnimationFrame(step);
      else scroller.scrollTop = end;
    };
    step();
  };

  const updateAnchor = () => {
    const scrollPos = document.scrollingElement.scrollTop;
    const i = anchors.findIndex(el => el.offsetTop > scrollPos);
    if (i !== -1) {
      let inview = anchors[i];
      if (inview.offsetTop > scrollPos + window.innerHeight) {
        inview = anchors[i - 1];
      }
      const newAnchor = document.querySelector(`[href='#${inview.id}']`);
      if (newAnchor && newAnchor !== currentAnchor) {
        if (currentAnchor) currentAnchor.classList.remove('selected');
        newAnchor.classList.add('selected');
        currentAnchor = newAnchor;
        history.replaceState(undefined, undefined, `#${inview.id}`);
      }
    }
    if (scrollPos > 60) {
      document.body.classList.add('docs-scrolled');
    } else {
      document.body.classList.remove('docs-scrolled');
    }
  };

  [...document.querySelectorAll('a')]
    .filter(a => a.getAttribute('href')[0] === '#')
    .forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove('docs-nav-visible');
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
