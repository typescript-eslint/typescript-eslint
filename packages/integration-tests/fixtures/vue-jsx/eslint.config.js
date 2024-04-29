const vue = require('eslint-plugin-vue');
const tseslint = require('typescript-eslint');

module.exports = [
  ...vue.configs['flat/essential'],
  {
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
