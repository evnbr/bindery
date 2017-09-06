const system = () => {
  return navigator.userAgent;
};

const browser = () => {
  const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  const isFirefox = typeof InstallTrigger !== 'undefined';
  const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
  const isIE = /*@cc_on!@*/false || !!document.documentMode;
  const isEdge = !isIE && !!window.StyleMedia;
  const isChrome = !!window.chrome && !!window.chrome.webstore;
  const isBlink = (isChrome || isOpera) && !!window.CSS;

  if (isOpera) return 'Opera';
  if (isFirefox) return 'Mozilla Firefox';
  if (isSafari) return 'Safari';
  if (isChrome) return 'Google Chrome';
  if (isIE) return 'Microsoft Internet Explorer??';
  if (isEdge) return 'Microsoft Edge';
  return 'an unknown browser';
};


if (document.getElementById('colophon')) {
  const now = document.getElementById('now');
  now.textContent = window.moment().format('h:mm:ss A on MMMM DD, YYYY');

  const winSize = document.getElementById('windowSize');
  winSize.textContent = `${window.innerWidth} by ${window.innerHeight}`;

  const scrSize = document.getElementById('screenSize');
  scrSize.textContent = screen.width + ' by ' + screen.height;

  const dpr = document.getElementById('devicePixelRatio');
  dpr.textContent = window.devicePixelRatio;

  const b = document.getElementById('browser');
  b.textContent = browser();

  const ua = document.getElementById('userAgent');
  ua.textContent = system();

  window.addEventListener('resize', () => {
    winSize.textContent = `${window.innerWidth} by ${window.innerHeight}`;
    now.textContent = window.moment().format('h:mm:ss A on MMMM Do YYYY');
  });
}
