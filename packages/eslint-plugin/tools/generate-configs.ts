/* eslint-disable no-console */

import { TSESLint } from '@typescript-eslint/experimental-utils';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { format } from 'prettier';
import rules from '../src/rules';

import prettierConfig = require('../../../.prettierrc.json');

interface LinterConfigRules {
  [name: string]:
    | TSESLint.Linter.RuleLevel
    | TSESLint.Linter.RuleLevelAndOptions;
}

interface LinterConfig extends TSESLint.Linter.Config {
  extends?: string | string[];
  plugins?: string[];
}

const RULE_NAME_PREFIX = '@typescript-eslint/';
const MAX_RULE_NAME_LENGTH = 32;
const DEFAULT_RULE_SETTING = 'warn';
const BASE_RULES_TO_BE_OVERRIDDEN = new Set([
  'camelcase',
  'func-call-spacing',
  'indent',
  'no-array-constructor',
  'no-empty-function',
  'no-extra-parens',
  'no-magic-numbers',
  'no-unused-vars',
  'no-use-before-define',
  'no-useless-constructor',
  'require-await',
  'semi',
]);

const ruleEntries = Object.entries(rules).sort((a, b) =>
  a[0].localeCompare(b[0]),
);

/**
 * Helper function reduces records to key - value pairs.
 * @param config
 * @param entry
 */
const reducer = <TMessageIds extends string>(
  config: LinterConfigRules,
  entry: [string, TSESLint.RuleModule<TMessageIds, any, any>],
  settings: {
    errorLevel?: 'error' | 'warn';
    filterDeprecated: boolean;
  },
) => {
  const key = entry[0];
  const value = entry[1];

  if (settings.filterDeprecated && value.meta.deprecated) {
    return config;
  }

  const ruleName = `${RULE_NAME_PREFIX}${key}`;
  const recommendation = value.meta.docs.recommended;
  const usedSetting = settings.errorLevel
    ? settings.errorLevel
    : !recommendation
    ? DEFAULT_RULE_SETTING
    : recommendation;

  if (BASE_RULES_TO_BE_OVERRIDDEN.has(key)) {
    console.log(
      key
        .padStart(RULE_NAME_PREFIX.length + key.length)
        .padEnd(RULE_NAME_PREFIX.length + MAX_RULE_NAME_LENGTH),
      '=',
      chalk.green('off'),
    );
    config[key] = 'off';
  }
  console.log(
    `${chalk.dim(RULE_NAME_PREFIX)}${key.padEnd(MAX_RULE_NAME_LENGTH)}`,
    '=',
    usedSetting === 'error'
      ? chalk.red(usedSetting)
      : chalk.yellow(usedSetting),
  );
  config[ruleName] = usedSetting;

  return config;
};

/**
 * Helper function writes configuration.
 */
function writeConfig(config: LinterConfig, filePath: string): void {
  const configStr = format(JSON.stringify(config), {
    parser: 'json',
    ...(prettierConfig as any),
  });
  fs.writeFileSync(filePath, configStr);
}

const baseConfig: LinterConfig = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
};
writeConfig(baseConfig, path.resolve(__dirname, '../src/configs/base.json'));

console.log();
console.log(
  '---------------------------------- all.json ----------------------------------',
);
const allConfig: LinterConfig = {
  extends: './configs/base.json',
  rules: ruleEntries.reduce<LinterConfigRules>(
    (config, entry) =>
      reducer(config, entry, { errorLevel: 'error', filterDeprecated: true }),
    {},
  ),
};
writeConfig(allConfig, path.resolve(__dirname, '../src/configs/all.json'));

console.log();
console.log(
  '------------------------------ recommended.json ------------------------------',
);
const recommendedConfig: LinterConfig = {
  extends: './configs/base.json',
  rules: ruleEntries
    .filter(entry => !!entry[1].meta.docs.recommended)
    .reduce<LinterConfigRules>(
      (config, entry) => reducer(config, entry, { filterDeprecated: false }),
      {},
    ),
};
writeConfig(
  recommendedConfig,
  path.resolve(__dirname, '../src/configs/recommended.json'),
);
