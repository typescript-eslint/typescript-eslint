const vue = require('eslint-plugin-vue');
const tseslint = require('typescript-eslint');

module.exports = [
  ...vue.configs['flat/essential'],
  {
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: '/usr/linked/tsconfig.json',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'semi-spacing': 'error',
    },
  },
];
