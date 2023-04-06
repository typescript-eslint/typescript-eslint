const baseConfig = require('../../eslint.config.js');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const { FlatCompat } = require('@eslint/eslintrc');

const eslintrc = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...baseConfig,
  ...eslintrc.extends(
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ),
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      'react/jsx-no-target-blank': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
      'react/jsx-curly-brace-presence': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: [
      './*.config.*',
      './src/pages/*.tsx',
      './src/components/**/*.tsx',
      './src/components/hooks/*.ts',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },
];
