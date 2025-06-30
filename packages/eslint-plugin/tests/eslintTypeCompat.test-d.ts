// eslint itself doesn't export these types, but config-helpers does.
import type {
  Plugin as EslintPluginType,
  Config as EslintConfigType,
} from '@eslint/config-helpers';

import { defineConfig } from '@eslint/config-helpers';

// intentionally testing the types accessed from the external entry point due to hand-authored d.ts shenanigans
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import * as rawPlugin from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/raw-plugin';

type ValueOf<T> = T[keyof T];

type FlatConfigActualType = ValueOf<typeof rawPlugin.flatConfigs>;

describe('our types should be compatible with eslint', () => {
  test('exported raw parser should be assignable to typescript-eslint parser type', () => {
    expectTypeOf(rawPlugin.parser).toExtend<FlatConfig.Parser>();
  });

  test('exported raw parser should be compatible with defineConfig', () => {
    // should be callable like this.
    defineConfig({
      languageOptions: {
        parser: rawPlugin.parser,
      },
    });
  });

  test('exported raw plugin should be assignable to typescript-eslint plugin type', () => {
    expectTypeOf(rawPlugin.plugin).toExtend<FlatConfig.Plugin>();
  });

  test('exported raw plugin should be assignable to eslint plugin type', () => {
    expectTypeOf(rawPlugin.plugin).toExtend<EslintPluginType>();
  });

  test('exported raw plugin should be compatible with defineConfig', () => {
    // should be callable like this.
    defineConfig({
      plugins: {
        '@typescript-eslint':
          rawPlugin.plugin.rules['a string'].meta.docs.recommended,
        partial: null! as Omit<typeof rawPlugin.plugin, 'rules'>,
      },
    });
  });

  test('exported flat configs should be assignable to typescript-eslint config type', () => {
    expectTypeOf<FlatConfigActualType>().toExtend<
      FlatConfig.Config | FlatConfig.ConfigArray
    >();
  });

  test('exported flat configs should be assignable to eslint config type', () => {
    expectTypeOf<FlatConfigActualType>().toExtend<
      EslintConfigType | EslintConfigType[]
    >();
  });

  test('exported recommended flat config should be compatible with defineConfig', () => {
    const flatConfig = null! as FlatConfigActualType;
    // should be callable like this.
    defineConfig(flatConfig);
  });
});
