const throttleFrame = () => {
  let wasCalled = false;
  let queued;
  return (func) => {
    if (wasCalled) {
      queued = func;
      return;
    }
    wasCalled = true;
    func();
    requestAnimationFrame(() => {
      wasCalled = false;
      if (queued) {
        queued();
        queued = null;
      }
    });
  };
};

const throttleTime = (time) => {
  let wasCalled = false;
  let queued;
  return (func) => {
    if (wasCalled) {
      queued = func;
      return;
    }
    wasCalled = true;
    func();
    setTimeout(() => {
      wasCalled = false;
      if (queued) {
        queued();
        queued = null;
      }
    }, time);
  };
};


export { throttleFrame, throttleTime };
