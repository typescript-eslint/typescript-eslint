const markdown = require('eslint-plugin-markdown');
const tseslint = require('typescript-eslint');

module.exports = [
  ...markdown.configs.recommended,
  {
    files: ['**/*.md/*.{js,ts,jsx,tsx,javascript,node}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      markdown,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
];
