import Thenable from '../Thenable';

test('Calls then synchronously', (done) => {
  new Thenable((resolve) => {
    resolve();
  }).then(done);
});

test('Calls then asynchronously', (done) => {
  new Thenable((resolve) => {
    setTimeout(resolve, 200);
  }).then(done);
});

test('Calls catch synchronously', (done) => {
  new Thenable((resolve, reject) => {
    reject();
  }).catch(done);
});

test('Calls catch asynchronously', (done) => {
  new Thenable((resolve, reject) => {
    setTimeout(reject, 200);
  }).catch(done);
});

test('Calls second chained then', (done) => {
  new Thenable((resolve) => {
    resolve();
  }).then(() => {}).then(done);
});

test('Calls second chained catch', (done) => {
  new Thenable((resolve, reject) => {
    reject();
  }).catch(() => {}).catch(done);
});

test('Calls chained funcs that return thenables', (done) => {
  const syncFunction = () => new Thenable((resolve) => {
    resolve();
  });

  syncFunction()
    .then(syncFunction)
    .then(syncFunction)
    .then(syncFunction)
    .then(done);
});

// TODO
// test('Calls chained async funcs that return thenables', (done) => {
//   const asyncFunction = () => new Thenable((resolve) => {
//     setTimeout(resolve, 200);
//   });
//
//   asyncFunction()
//     .then(asyncFunction)
//     .then(asyncFunction)
//     .then(asyncFunction)
//     .then(done);
// });


// TODO
// test('Calls chained then twice', (done) => {
//   new Thenable((resolve) => {
//     resolve();
//   }).then(() => {}).then(() => {}).then(done);
// });
