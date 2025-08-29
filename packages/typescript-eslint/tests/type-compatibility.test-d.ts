import { defineConfig } from 'eslint/config';

import tseslint from '../src/index';

/* eslint @typescript-eslint/no-deprecated: ["error", { "allow": [{ "from": "file", "name": "config", "path": "packages/typescript-eslint/src/config-helper.ts" }] }] */

describe('test for compatibility with config helpers', () => {
  test('exported plugin is compatible with tseslint.config()', () => {
    tseslint.config({
      plugins: {
        '@typescript-eslint': tseslint.plugin,
      },
    });
  });

  test('exported plugin is compatible with defineConfig()', () => {
    defineConfig({
      plugins: {
        '@typescript-eslint': tseslint.plugin,
      },
    });
  });

  test('exported parser is compatible with tseslint.config()', () => {
    tseslint.config({
      languageOptions: {
        parser: tseslint.parser,
      },
    });
  });

  test('exported parser is compatible with defineConfig()', () => {
    defineConfig({
      languageOptions: {
        parser: tseslint.parser,
      },
    });
  });

  test('exported configs are compatible with tseslint.config()', () => {
    tseslint.config(tseslint.configs.recommendedTypeChecked);
    tseslint.config(tseslint.configs.strict);
    tseslint.config(tseslint.configs.eslintRecommended);
  });

  test('exported configs are compatible with defineConfig()', () => {
    defineConfig(tseslint.configs.recommendedTypeChecked);
    defineConfig(tseslint.configs.strict);
    defineConfig(tseslint.configs.eslintRecommended);
  });
});
