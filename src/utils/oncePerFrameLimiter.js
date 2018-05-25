const oncePerFrameLimiter = () => {
  let wasCalled = false;
  return (func) => {
    if (wasCalled) return;
    wasCalled = true;
    func();
    requestAnimationFrame(() => { wasCalled = false; });
  };
};

const oncePerTimeLimiter = (time) => {
  let wasCalled = false;
  return (func) => {
    if (wasCalled) return;
    wasCalled = true;
    func();
    setTimeout(() => { wasCalled = false; }, time);
  };
};


export { oncePerFrameLimiter, oncePerTimeLimiter };
