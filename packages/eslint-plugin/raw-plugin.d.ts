import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import type * as parserBase from '@typescript-eslint/parser';

import type plugin from './index';

type TSESLintParser = {
  meta: typeof parserBase.meta;
  parseForESLint: typeof parserBase.parseForESLint;
};

type TSESLintConfig = {
  name?: string;
  rules?: Record<string, any>;
  languageOptions?: {
    sourceType?: 'module';
    parser?: TSESLintParser;
    parserOptions?: Record<string, unknown>;
  };
};

declare const cjsExport: {
  flatConfigs: {
    'flat/all': TSESLintConfig[];
    'flat/base': TSESLintConfig;
    'flat/disable-type-checked': TSESLintConfig;
    'flat/eslint-recommended': TSESLintConfig;
    'flat/recommended': TSESLintConfig[];
    'flat/recommended-type-checked': TSESLintConfig[];
    'flat/recommended-type-checked-only': TSESLintConfig[];
    'flat/strict': TSESLintConfig[];
    'flat/strict-type-checked': TSESLintConfig[];
    'flat/strict-type-checked-only': TSESLintConfig[];
    'flat/stylistic': TSESLintConfig[];
    'flat/stylistic-type-checked': TSESLintConfig[];
    'flat/stylistic-type-checked-only': TSESLintConfig[];
  };
  parser: TSESLintParser;
  plugin: typeof plugin;
};

export = cjsExport;
