const isCommandP = (e: KeyboardEvent) => {
  return (e.ctrlKey || e.metaKey) && e.keyCode === 80;
}

// Automatically switch into print mode
const listenForPrint = (beforePrint: Function) => {
  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener((mql) => {
      if (mql.matches) {
        // before print
        beforePrint();
      } else {
        // after print
      }
    });
  }
  document.body.addEventListener('keydown', (e) => {
    if (isCommandP(e)) {
      e.preventDefault();
      beforePrint();
      setTimeout(() => window.print(), 200);
    }
  });
};

export default listenForPrint;
