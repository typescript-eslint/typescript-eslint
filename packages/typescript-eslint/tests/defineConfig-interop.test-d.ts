import { defineConfig } from 'eslint/config';

import * as tseslint from '../src/index.js';

// Type tests to ensure that migration from `tseslint.config()` -> `defineConfig()`
// doesn't introduce type errors for the user. We don't care about the
// `defineConfig()` -> `tseslint.config()` direction.
describe('tseslint.config() should be replaceable with defineConfig()', () => {
  it('should work with recommended setup', () => {
    expectTypeOf(defineConfig).toBeCallableWith(tseslint.configs.recommended);
  });

  it('should allow manual assignment of the plugin', () => {
    expectTypeOf(defineConfig).toBeCallableWith({
      plugins: {
        ts: tseslint.plugin,
      },
    });
  });

  it('should allow manual assignment of the parser', () => {
    expectTypeOf(defineConfig).toBeCallableWith({
      languageOptions: {
        parser: tseslint.parser,
      },
    });
  });
});
