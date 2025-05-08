import type * as eslintConfigHelpers from '@eslint/config-helpers';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import type plugin from './index';

declare const cjsExport: {
  flatConfigs: {
    'flat/all': eslintConfigHelpers.Config[];
    'flat/base': eslintConfigHelpers.Config;
    'flat/disable-type-checked': eslintConfigHelpers.Config;
    'flat/eslint-recommended': eslintConfigHelpers.Config;
    'flat/recommended': eslintConfigHelpers.Config[];
    'flat/recommended-type-checked': eslintConfigHelpers.Config[];
    'flat/recommended-type-checked-only': eslintConfigHelpers.Config[];
    'flat/strict': eslintConfigHelpers.Config[];
    'flat/strict-type-checked': eslintConfigHelpers.Config[];
    'flat/strict-type-checked-only': eslintConfigHelpers.Config[];
    'flat/stylistic': eslintConfigHelpers.Config[];
    'flat/stylistic-type-checked': eslintConfigHelpers.Config[];
    'flat/stylistic-type-checked-only': eslintConfigHelpers.Config[];
  };
  parser: FlatConfig.Parser;
  plugin: typeof plugin;
};

export = cjsExport;
