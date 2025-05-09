import { defineConfig } from 'eslint/config';

import * as tseslint from '../src/index';

describe('tseslint.config() should be replaceable with defineConfig()', () => {
  it('should work with recommended setup', () => {
    defineConfig(tseslint.configs.recommended);
  });

  it('should allow manual assignment of the plugin', () => {
    defineConfig({
      plugins: {
        ts: tseslint.plugin,
      },
    });
  });

  it('should allow manual assignment of the parser', () => {
    defineConfig({
      languageOptions: {
        parser: tseslint.parser,
      },
    });
  });
});
