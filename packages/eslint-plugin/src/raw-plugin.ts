import type { TSESLint } from '@typescript-eslint/utils';
import type { FlatConfig, Linter } from '@typescript-eslint/utils/ts-eslint';

import * as parserBase from '@typescript-eslint/parser';

import all from './configs/eslintrc/all';
import base from './configs/eslintrc/base';
import disableTypeChecked from './configs/eslintrc/disable-type-checked';
import eslintRecommended from './configs/eslintrc/eslint-recommended';
import recommended from './configs/eslintrc/recommended';
import recommendedTypeChecked from './configs/eslintrc/recommended-type-checked';
import recommendedTypeCheckedOnly from './configs/eslintrc/recommended-type-checked-only';
import strict from './configs/eslintrc/strict';
import strictTypeChecked from './configs/eslintrc/strict-type-checked';
import strictTypeCheckedOnly from './configs/eslintrc/strict-type-checked-only';
import stylistic from './configs/eslintrc/stylistic';
import stylisticTypeChecked from './configs/eslintrc/stylistic-type-checked';
import stylisticTypeCheckedOnly from './configs/eslintrc/stylistic-type-checked-only';
import allFlat from './configs/flat/all';
import baseFlat from './configs/flat/base';
import disableTypeCheckedFlat from './configs/flat/disable-type-checked';
import eslintRecommendedFlat from './configs/flat/eslint-recommended';
import recommendedFlat from './configs/flat/recommended';
import recommendedTypeCheckedFlat from './configs/flat/recommended-type-checked';
import recommendedTypeCheckedOnlyFlat from './configs/flat/recommended-type-checked-only';
import strictFlat from './configs/flat/strict';
import strictTypeCheckedFlat from './configs/flat/strict-type-checked';
import strictTypeCheckedOnlyFlat from './configs/flat/strict-type-checked-only';
import stylisticFlat from './configs/flat/stylistic';
import stylisticTypeCheckedFlat from './configs/flat/stylistic-type-checked';
import stylisticTypeCheckedOnlyFlat from './configs/flat/stylistic-type-checked-only';
import rules from './rules';

const parser: TSESLint.FlatConfig.Parser = {
  meta: parserBase.meta,
  parseForESLint: parserBase.parseForESLint,
};

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const { name, version } = require('../package.json') as {
  name: string;
  version: string;
};

const plugin = {
  // not fully initialized yet.
  // See https://eslint.org/docs/latest/extend/plugins#configs-in-plugins
  configs: {
    all,
    base,
    'disable-type-checked': disableTypeChecked,
    'eslint-recommended': eslintRecommended,
    recommended,
    /** @deprecated - please use "recommended-type-checked" instead. */
    'recommended-requiring-type-checking': recommendedTypeChecked,
    'recommended-type-checked': recommendedTypeChecked,
    'recommended-type-checked-only': recommendedTypeCheckedOnly,
    strict,
    'strict-type-checked': strictTypeChecked,
    'strict-type-checked-only': strictTypeCheckedOnly,
    stylistic,
    'stylistic-type-checked': stylisticTypeChecked,
    'stylistic-type-checked-only': stylisticTypeCheckedOnly,
  },
  meta: {
    name,
    version,
  },
  rules,
} satisfies Linter.Plugin;

// @ts-expect-error -- upstream type incompatibility stuff
const flatPlugin = plugin as FlatConfig.Plugin;

// included due to https://github.com/eslint/eslint/issues/19513
const flatConfigs = {
  'flat/all': allFlat(flatPlugin, parser),
  'flat/base': baseFlat(flatPlugin, parser),
  'flat/disable-type-checked': disableTypeCheckedFlat(flatPlugin, parser),
  'flat/eslint-recommended': eslintRecommendedFlat(flatPlugin, parser),
  'flat/recommended': recommendedFlat(flatPlugin, parser),
  'flat/recommended-type-checked': recommendedTypeCheckedFlat(
    flatPlugin,
    parser,
  ),
  'flat/recommended-type-checked-only': recommendedTypeCheckedOnlyFlat(
    flatPlugin,
    parser,
  ),
  'flat/strict': strictFlat(flatPlugin, parser),
  'flat/strict-type-checked': strictTypeCheckedFlat(flatPlugin, parser),
  'flat/strict-type-checked-only': strictTypeCheckedOnlyFlat(
    flatPlugin,
    parser,
  ),
  'flat/stylistic': stylisticFlat(flatPlugin, parser),
  'flat/stylistic-type-checked': stylisticTypeCheckedFlat(flatPlugin, parser),
  'flat/stylistic-type-checked-only': stylisticTypeCheckedOnlyFlat(
    flatPlugin,
    parser,
  ),
} satisfies Record<
  `flat/${string}`,
  TSESLint.FlatConfig.Config | TSESLint.FlatConfig.ConfigArray
>;

Object.assign(plugin.configs, flatConfigs);

export = {
  flatConfigs,
  parser,
  plugin,
};
