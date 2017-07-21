
module.exports = {
  "env": {
    "browser": true,
    "node": true
  },
  extends: 'airbnb-base',
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': ['warn'],
    'no-console': 0,
    'class-methods-use-this': 0,
    'func-names': ['error', 'as-needed'],
    'no-param-reassign': ['error', { 'props': false }]
  },
};
