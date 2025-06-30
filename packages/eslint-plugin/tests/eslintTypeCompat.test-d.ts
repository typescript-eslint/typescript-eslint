// eslint itself doesn't export these types, but config-helpers does.
import type {
  Plugin as EslintPluginType,
  Config as EslintConfigType,
} from '@eslint/config-helpers';

import { defineConfig } from '@eslint/config-helpers';

// intentionally testing the types accessed from the external entry point due to hand-authored d.ts shenanigans
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import * as rawPlugin from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/raw-plugin';

type EslintParserType = NonNullable<
  NonNullable<EslintConfigType['languageOptions']>['parser']
>;

type ValueOf<T> = T[keyof T];

describe('our types should be compatible with eslint', () => {
  test('exported raw plugin should be assignable to eslint plugin type', () => {
    expectTypeOf(rawPlugin.plugin).toExtend<EslintPluginType>();
  });

  test('exported raw parser should be assignable to eslint parser type', () => {
    expectTypeOf(rawPlugin.parser).toExtend<EslintParserType>();
  });

  test('exported flat configs should be assignable to eslint config type', () => {
    expectTypeOf<ValueOf<typeof rawPlugin.flatConfigs>>().toExtend<
      EslintConfigType | EslintConfigType[]
    >();
  });

  test('exported recommended flat config should be usable with defineConfig', () => {
    expectTypeOf(defineConfig).toBeCallableWith<
      ValueOf<typeof rawPlugin.flatConfigs>
    >();
  });

  test('exported raw plugin should be assignable to our plugin type', () => {
    expectTypeOf(rawPlugin.plugin).toExtend<FlatConfig.Plugin>();
  });

  test('exported raw parser should be assignable to our parser type', () => {
    expectTypeOf(rawPlugin.parser).toExtend<FlatConfig.Parser>();
  });

  // so that it works with `tseslint.config()`.
  test('exported flat configs should be assignable to our config type', () => {
    expectTypeOf<ValueOf<typeof rawPlugin.flatConfigs>>().toExtend<
      FlatConfig.Config | FlatConfig.ConfigArray
    >();
  });
});
