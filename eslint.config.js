const perfectionist = require('eslint-plugin-perfectionist');
const expoConfig = require('eslint-config-expo/flat');
/* eslint-env node */
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      perfectionist,
    },
  },
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],
      'perfectionist/sort-named-imports': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],
      'perfectionist/sort-exports': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],
      'perfectionist/sort-named-exports': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],
    },
  },
]);
