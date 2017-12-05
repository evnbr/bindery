/* global platform */

const updateColophon = (el, binderyInfo) => {
  if (el.querySelector('#colophon')) {
    const now = el.querySelector('#now');
    now.textContent = window.moment().format('h:mm:ss A on MMMM DD, YYYY');

    const b = el.querySelector('#browser');
    b.textContent = `${platform.description}, using the ${platform.layout} layout engine`;

    const displayInfo = el.querySelector('#displayInfo');

    const updateScreenSize = () => {
      if (binderyInfo) {
        displayInfo.textContent = `It was converted to a book using Bindery ${binderyInfo.version}.`;
      } else {
        displayInfo.textContent = `It is displayed at ${window.innerWidth} by ${window.innerHeight} pixels on a screen of ${screen.width} by ${screen.height} pixels, with a device pixel ratio of ${window.devicePixelRatio}.`;
      }
    };
    updateScreenSize();

    window.addEventListener('resize', () => {
      updateScreenSize();
      now.textContent = window.moment().format('h:mm:ss A on MMMM Do YYYY');
    });
  }
};

updateColophon(document.body);
