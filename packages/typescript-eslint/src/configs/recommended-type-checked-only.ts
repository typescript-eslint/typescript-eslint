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
    name: 'typescript-eslint/recommended-type-checked-only',
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      'no-implied-eval': 'off',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/unbound-method': 'error',
    },
  },
];
