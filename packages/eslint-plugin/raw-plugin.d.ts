import type {
  ClassicConfig,
  FlatConfig,
} from '@typescript-eslint/utils/ts-eslint';

import type plugin from './index.d.ts';

declare const cjsExport = {
  parser: FlatConfig.Parser,
  plugin,
  flatConfigs: {
    'flat/all': FlatConfig.ConfigArray,
    'flat/base': FlatConfig.Config,
    'flat/disable-type-checked': FlatConfig.Config,
    'flat/eslint-recommended': FlatConfig.Config,
    'flat/recommended': FlatConfig.ConfigArray,
    'flat/recommended-type-checked': FlatConfig.ConfigArray,
    'flat/recommended-type-checked-only': FlatConfig.ConfigArray,
    'flat/strict': FlatConfig.ConfigArray,
    'flat/strict-type-checked': FlatConfig.ConfigArray,
    'flat/strict-type-checked-only': FlatConfig.ConfigArray,
    'flat/stylistic': FlatConfig.ConfigArray,
    'flat/stylistic-type-checked': FlatConfig.ConfigArray,
    'flat/stylistic-type-checked-only': FlatConfig.ConfigArray,
  },
};

export = cjsExport;
