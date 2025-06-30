import type { parseForESLint } from '@typescript-eslint/parser';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import type plugin from './index';

interface TSESLintParser {
  meta: {
    name: string;
    version: string;
  };
  parseForESLint: typeof parseForESLint;
}

declare const cjsExport: {
  flatConfigs: {
    'flat/all': FlatConfig.ConfigArray;
    'flat/base': FlatConfig.Config;
    'flat/disable-type-checked': FlatConfig.Config;
    'flat/eslint-recommended': FlatConfig.Config;
    'flat/recommended': FlatConfig.ConfigArray;
    'flat/recommended-type-checked': FlatConfig.ConfigArray;
    'flat/recommended-type-checked-only': FlatConfig.ConfigArray;
    'flat/strict': FlatConfig.ConfigArray;
    'flat/strict-type-checked': FlatConfig.ConfigArray;
    'flat/strict-type-checked-only': FlatConfig.ConfigArray;
    'flat/stylistic': FlatConfig.ConfigArray;
    'flat/stylistic-type-checked': FlatConfig.ConfigArray;
    'flat/stylistic-type-checked-only': FlatConfig.ConfigArray;
  };
  parser: TSESLintParser;
  // hide the configs from downstream users, since this isn't how we want them
  // to be accessed.
  plugin: Omit<typeof plugin, 'configs'>;
};

export = cjsExport;
