import type * as parserBase from '@typescript-eslint/parser';
import type { Linter } from '@typescript-eslint/utils/ts-eslint';

export interface TSESLintParser {
  meta: typeof parserBase.meta;
  parseForESLint: typeof parserBase.parseForESLint;
}

export interface TSESLintConfig {
  name?: string;
  rules?: Record<string, unknown>;
  files?: string[];
  languageOptions?: {
    sourceType?: 'module';
    parser?: TSESLintParser;
    parserOptions?: Record<string, unknown>;
  };

  // causes type errors :shrug:
  // plugins?: {
  //   '@typescript-eslint': TSESLintPlugin;
  // };
}

export interface TSESLintPlugin {
  configs: Record<string, TSESLintConfig | TSESLintConfig[]>;
  meta: {
    name: string;
    version: string;
  };
  rules: Record<string, Linter.PluginRules>;
}

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
