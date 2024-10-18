// @ts-check

import tseslintInternalPlugin from '@typescript-eslint/eslint-plugin-internal';
import tseslint from 'typescript-eslint';

import eslintPluginPlugin from '../eslint-plugin-eslint-plugin/lib/index.js';

export default tseslint.config({
  files: ['packages/*/src/rules/*.ts'],
  ignores: ['packages/*/dist', '**/*.js'],
  languageOptions: {
    parser: tseslint.parser,
  },
  linterOptions: {
    reportUnusedDisableDirectives: false,
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    '@typescript-eslint/internal': tseslintInternalPlugin,
    'eslint-plugin': eslintPluginPlugin,
  },
  rules: {
    'eslint-plugin/require-meta-schema-description': 'error',
  },
});
