// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// SEE https://typescript-eslint.io/users/configs
//
// For developers working in the typescript-eslint monorepo:
// You can regenerate it using `yarn generate:configs`

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import baseConfig from './base';
import eslintRecommendedConfig from './eslint-recommended';

export default (
  plugin: FlatConfig.Plugin,
  parser: FlatConfig.Parser,
): FlatConfig.ConfigArray => [
  baseConfig(plugin, parser),
  eslintRecommendedConfig(plugin, parser),
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/ban-types': 'error',
      'no-array-constructor': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      'no-loss-of-precision': 'off',
      '@typescript-eslint/no-loss-of-precision': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
    },
  },
];
