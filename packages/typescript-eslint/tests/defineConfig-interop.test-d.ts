import { defineConfig } from 'eslint/config';

import type { Linter } from 'eslint';

import * as tseslint from '../src/index.js';

describe('tseslint.config() should be replaceable with defineConfig()', () => {
  it('should work with recommended setup', () => {
    const eslintConfig = defineConfig(tseslint.configs.recommended);

    const tseslintConfig = tseslint.config(tseslint.configs.recommended);

    expectTypeOf(defineConfig)
      .toBeCallableWith(tseslint.configs.recommended)
      .returns.items.toExtend<(typeof tseslintConfig)[number]>();

    expectTypeOf(eslintConfig).toExtend<typeof tseslintConfig>();

    expectTypeOf(eslintConfig).items.toExtend<
      (typeof tseslintConfig)[number]
    >();
  });

  it('should allow manual assignment of the plugin', () => {
    expectTypeOf(defineConfig)
      .toBeCallableWith({
        plugins: {
          ts: tseslint.plugin,
        },
      })
      .returns.items.toEqualTypeOf<Linter.Config>();
  });

  it('should allow manual assignment of the parser', () => {
    expectTypeOf(defineConfig)
      .toBeCallableWith({
        languageOptions: {
          parser: tseslint.parser,
        },
      })
      .returns.items.toEqualTypeOf<Linter.Config>();
  });
});
