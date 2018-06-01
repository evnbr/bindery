import prefix from './prefixer';

test('Adds prefix', () => {
  expect(prefix('classname')).toEqual('📖-classname');
});

test('Adds prefix with dot', () => {
  expect(prefix('.classname')).toEqual('.📖-classname');
});
