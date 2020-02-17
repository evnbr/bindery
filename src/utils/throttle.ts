const throttleFrame = () => {
  let wasCalled = false;
  let queued: Function;
  const inner = (func: Function) => {
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

const throttleTime = (ms: number) => {
  let wasCalled = false;
  let queued: Function;
  const inner = (func: Function) => {
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
    }, ms);
  };
  return inner;
};


export { throttleFrame, throttleTime };
