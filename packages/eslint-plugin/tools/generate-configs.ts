/* eslint-disable no-console */

import { Linter } from 'eslint';
import fs from 'fs';
import path from 'path';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import rules from '../src/rules';

interface LinterConfigRules {
  [name: string]: Linter.RuleLevel | Linter.RuleLevelAndOptions;
}

interface LinterConfig extends Linter.Config {
  extends?: string | string[];
  plugins?: string[];
}

const RULE_NAME_PREFIX = '@typescript-eslint/';
const MAX_RULE_NAME_LENGTH = 32 + RULE_NAME_PREFIX.length;
const DEFAULT_RULE_SETTING = 'warn';
const BASE_RULES_TO_BE_OVERRIDDEN = new Set([
  'camelcase',
  'indent',
  'no-array-constructor',
  'no-unused-vars',
  'no-useless-constructor',
]);

const ruleEntries = Object.entries(rules);

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
    console.log(key.padEnd(MAX_RULE_NAME_LENGTH), '=', 'off');
    config[key] = 'off';
  }
  console.log(ruleName.padEnd(MAX_RULE_NAME_LENGTH), '=', usedSetting);
  config[ruleName] = usedSetting;

  return config;
};

/**
 * Helper function writes configuration.
 */
function writeConfig(config: LinterConfig, filePath: string): void {
  fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`);
}

const baseConfig: LinterConfig = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
};
writeConfig(baseConfig, path.resolve(__dirname, '../src/configs/base.json'));

console.log('------------------------- all.json -------------------------');
const allConfig: LinterConfig = {
  extends: './configs/base.json',
  rules: ruleEntries.reduce<LinterConfigRules>(
    (config, entry) =>
      reducer(config, entry, { errorLevel: 'error', filterDeprecated: true }),
    {},
  ),
};
writeConfig(allConfig, path.resolve(__dirname, '../src/configs/all.json'));

console.log('--------------------- recommended.json ---------------------');
const recommendedConfig: LinterConfig = {
  extends: './configs/base.json',
  rules: ruleEntries
    .filter(entry => !!entry[1].meta.docs.recommended)
    .reduce<LinterConfigRules>(
      (config, entry) => reducer(config, entry, { filterDeprecated: true }),
      {},
    ),
};
writeConfig(
  recommendedConfig,
  path.resolve(__dirname, '../src/configs/recommended.json'),
);
