const throttleFrame = () => {
  let wasCalled = false;
  let queued;
  const inner = (func) => {
    if (wasCalled) {
      queued = func;
      return;
    }
    wasCalled = true;
    func();
    requestAnimationFrame(() => {
      wasCalled = false;
      if (queued) {
        const queuedFunc = queued;
        queued = null;
        inner(queuedFunc);
      }
    });
  };
  return inner;
};

const throttleTime = (time) => {
  let wasCalled = false;
  let queued;
  const inner = (func) => {
    if (wasCalled) {
      queued = func;
      return;
    }
    wasCalled = true;
    func();
    setTimeout(() => {
      wasCalled = false;
      if (queued) {
        const queuedFunc = queued;
        queued = null;
        inner(queuedFunc);
      }
    }, time);
  };
  return inner;
};


export { throttleFrame, throttleTime };
