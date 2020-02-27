module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  testRegex: '^.+\\.test.ts$',
  testURL: 'http://localhost/',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['./jest.setup.js'],
};
