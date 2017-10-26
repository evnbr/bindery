import c from '../prefixClass';

test('Adds prefix', () => {
  expect(c('classname')).toEqual('📖-classname');
});

test('Adds prefix with dot', () => {
  expect(c('.classname')).toEqual('.📖-classname');
});
