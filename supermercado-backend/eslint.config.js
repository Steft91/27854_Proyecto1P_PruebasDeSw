const js = require('@eslint/js');
const globals = require('globals');

const commonRules = {
  ...js.configs.recommended.rules,
  semi: ['error', 'always'],
  quotes: ['error', 'single'],
  eqeqeq: 'error',
  camelcase: 'error',
};

module.exports = [
  {
    ignores: ['node_modules/', 'coverage/'],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: commonRules,
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: commonRules,
  },
];
