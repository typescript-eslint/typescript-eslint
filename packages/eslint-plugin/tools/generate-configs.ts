/* eslint-disable no-console */

import path from 'path';
import fs from 'fs';
import rules from '../src/rules';

const RULE_NAME_PREFIX = '@typescript-eslint/';
const MAX_RULE_NAME_LENGTH = 33 + RULE_NAME_PREFIX.length;

const ruleEntries = Object.entries(rules);

/**
 * Helper function reduces records to key - value pairs.
 * @param config
 * @param entry
 */
const reducer = (
  config: Record<string, string>,
  entry: Record<string, any>,
): Record<string, string> => {
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
 * Helper function generates configuration.
 */
function generate(rules: Record<string, string>, filePath: string): void {
  const config = Object.assign({ extends: './configs/base.json' }, { rules });

  fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`);
}

console.log('------------------------ all.json ------------------------');
generate(
  ruleEntries.reduce(reducer, {}),
  path.resolve(__dirname, '../src/configs/all.json'),
);

console.log('-------------------- recommended.json --------------------');
generate(
  ruleEntries
    .filter(entry => !!entry[1].meta.docs.recommended)
    .reduce(reducer, {}),
  path.resolve(__dirname, '../src/configs/recommended.json'),
);
