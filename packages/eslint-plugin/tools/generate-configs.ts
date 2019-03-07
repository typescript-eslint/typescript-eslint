/* eslint-disable no-console */

import path from 'path';
import fs from 'fs';
import rules from '../src/rules';
import RuleModule from 'ts-eslint';
import { Linter } from 'eslint';

const RULE_NAME_PREFIX = '@typescript-eslint/';
const MAX_RULE_NAME_LENGTH = 32 + RULE_NAME_PREFIX.length;

const ruleEntries = Object.entries(rules);

interface LinterConfigRules {
  [name: string]: Linter.RuleLevel;
}

interface LinterConfig extends Linter.Config {
  extends?: string | string[];
  plugins?: string[];
}

/**
 * Helper function reduces records to key - value pairs.
 * @param config
 * @param entry
 */
const reducer = <TMessageIds extends string>(
  config: LinterConfigRules,
  entry: [string, RuleModule<TMessageIds, any, any>],
) => {
  const key = entry[0];
  const value = entry[1];
  const ruleName = `${RULE_NAME_PREFIX}${key}`;
  const setting = value.meta.docs.recommended;
  const usedSetting = !setting ? 'warn' : setting;

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
  rules: {
    camelcase: 'off',
    indent: 'off',
    'no-array-constructor': 'off',
    'no-unused-vars': 'off',
    'no-useless-constructor': 'off',
  },
};
writeConfig(baseConfig, path.resolve(__dirname, '../src/configs/base.json'));

console.log('------------------------- all.json -------------------------');
const allConfig: LinterConfig = {
  extends: './configs/base.json',
  rules: ruleEntries.reduce(reducer, {}) as LinterConfigRules,
};
writeConfig(allConfig, path.resolve(__dirname, '../src/configs/all.json'));

console.log('--------------------- recommended.json ---------------------');
const recommendedConfig: LinterConfig = {
  extends: './configs/base.json',
  rules: ruleEntries
    .filter(entry => !!entry[1].meta.docs.recommended)
    .reduce(reducer, {}) as LinterConfigRules,
};
writeConfig(
  recommendedConfig,
  path.resolve(__dirname, '../src/configs/recommended.json'),
);
