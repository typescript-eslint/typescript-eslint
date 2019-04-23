/* eslint-disable no-console */

import path from 'path';
import fs from 'fs';
import requireIndex from 'requireindex';

const MAX_RULE_NAME_LENGTH = 33 + 'typescript-eslint/'.length;
const RULE_NAME_PREFIX = '@typescript-eslint';

const all = Object.entries(
  requireIndex(path.resolve(__dirname, '../dist/rules')),
);

const baseConfig = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
};

const bannedRules = new Set([
  'camelcase',
  'indent',
  'no-array-constructor',
  'no-unused-vars',
]);

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
  const ruleName = `${RULE_NAME_PREFIX}/${key}`;
  const setting = value.default.meta.docs.recommended;
  const usedSetting = !setting ? 'warn' : setting;

  // having this here is just for output niceness (the keys will be ordered)
  if (bannedRules.has(key)) {
    console.log(key.padEnd(MAX_RULE_NAME_LENGTH), '= off');
    config[key] = 'off';
  }
  console.log(ruleName.padEnd(MAX_RULE_NAME_LENGTH), '=', usedSetting);
  config[ruleName] = usedSetting;

  return config;
};

/**
 * Helper function to check for invalid recommended setting.
 */
function checkValidSettings(): boolean {
  const validSettings = ['error', 'warn', false];
  let result = true;

  all.forEach(entry => {
    const key = entry[0];
    const value = entry[1];
    const setting = value.default.meta.docs.recommended;

    if (!validSettings.includes(setting)) {
      console.error(`ERR! Invalid level for rule ${key}: "${setting}"`);
      result = false;
    }
  });

  return result;
}

/**
 * Helper function generates configuration.
 */
function generate(rules: Record<string, string>, filePath: string): void {
  const config = Object.assign({}, baseConfig, { rules });

  fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`);
}

if (checkValidSettings()) {
  console.log('------------------------- all.json -------------------------');
  generate(
    all.reduce(reducer, {}),
    path.resolve(__dirname, '../src/configs/all.json'),
  );

  console.log('--------------------- recommended.json ---------------------');
  const recommendedSettings = ['error', 'warn'];
  generate(
    all
      .filter(entry =>
        recommendedSettings.includes(entry[1].default.meta.docs.recommended),
      )
      .reduce(reducer, {}),
    path.resolve(__dirname, '../src/configs/recommended.json'),
  );
}
