import pluginBase from '@typescript-eslint/eslint-plugin';
import * as parserBase from '@typescript-eslint/parser';
// see the comment in config-helper.ts for why this doesn't use /ts-eslint
import type { TSESLint } from '@typescript-eslint/utils';

import { config } from './config-helper';
import allConfig from './configs/all';
import baseConfig from './configs/base';
import disableTypeCheckedConfig from './configs/disable-type-checked';
import eslintRecommendedConfig from './configs/eslint-recommended';
import recommendedConfig from './configs/recommended';
import recommendedTypeCheckedConfig from './configs/recommended-type-checked';
import strictConfig from './configs/strict';
import strictTypeCheckedConfig from './configs/strict-type-checked';
import stylisticConfig from './configs/stylistic';
import stylisticTypeCheckedConfig from './configs/stylistic-type-checked';

const parser: TSESLint.FlatConfig.Parser = {
  meta: parserBase.meta,
  parseForESLint: parserBase.parseForESLint,
};

const plugin: TSESLint.FlatConfig.Plugin = {
  meta: pluginBase.meta,
  rules: pluginBase.rules,
};

export = {
  config,
  configs: {
    all: allConfig(plugin, parser),
    base: baseConfig(plugin, parser),
    disableTypeChecked: disableTypeCheckedConfig(plugin, parser),
    eslintRecommended: eslintRecommendedConfig(plugin, parser),
    recommended: recommendedConfig(plugin, parser),
    recommendedTypeChecked: recommendedTypeCheckedConfig(plugin, parser),
    strict: strictConfig(plugin, parser),
    strictTypeChecked: strictTypeCheckedConfig(plugin, parser),
    stylistic: stylisticConfig(plugin, parser),
    stylisticTypeChecked: stylisticTypeCheckedConfig(plugin, parser),
  },
  parser,
  plugin,
};
