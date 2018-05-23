const oncePerFrameLimiter = () => {
  let wasCalled = false;
  return (func) => {
    if (wasCalled) return;
    wasCalled = true;
    func();
    requestAnimationFrame(() => { wasCalled = false; });
  };
};

export default oncePerFrameLimiter;
