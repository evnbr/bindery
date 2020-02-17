const throttleFrame = () => {
  let wasCalled = false;
  let queued: Function | undefined;
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
        queued = undefined;
        inner(queuedFunc);
      }
    });
  };
  return inner;
};

const throttleTime = (ms: number) => {
  let wasCalled = false;
  let queued: Function | undefined;
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
        queued = undefined;
        inner(queuedFunc);
      }
    }, ms);
  };
  return inner;
};


export { throttleFrame, throttleTime };
