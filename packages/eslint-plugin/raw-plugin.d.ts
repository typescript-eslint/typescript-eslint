import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import type plugin from './index';

import type * as eslintConfigHelpers from '@eslint/config-helpers';

declare const cjsExport: {
  flatConfigs: {
    'flat/all': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/base': eslintConfigHelpers.Config;
    'flat/disable-type-checked': eslintConfigHelpers.Config;
    'flat/eslint-recommended': eslintConfigHelpers.Config;
    'flat/recommended': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/recommended-type-checked': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/recommended-type-checked-only': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/strict': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/strict-type-checked': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/strict-type-checked-only': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/stylistic': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/stylistic-type-checked': eslintConfigHelpers.ConfigWithExtendsArray;
    'flat/stylistic-type-checked-only': eslintConfigHelpers.ConfigWithExtendsArray;
  };
  parser: FlatConfig.Parser;
  plugin: typeof plugin;
};

export = cjsExport;
