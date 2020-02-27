module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true
  },
  extends: 'airbnb-base',
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'no-unused-vars': ['warn'],
    'no-console': 0,
    'object-curly-newline': 0,
    'class-methods-use-this': 0,
    'func-names': ['error', 'as-needed'],
    'no-param-reassign': ['error', { props: false }],
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 0,
    'prefer-destructuring': 0
  }
};
