/* eslint-disable no-console */
'use strict';

import path from 'path';
import fs from 'fs';
import requireIndex from 'requireindex';

const bannedRecommendedRules = new Set([
  'camelcase',
  'indent',
  'no-array-constructor',
  'no-unused-vars'
]);
const MAX_RULE_NAME_LENGTH = 32 + 'typescript/'.length;

/**
 * Generate recommended configuration
 * @returns {void}
 */
function generate() {
  // replace this with Object.entries when node > 8
  const allRules = requireIndex(path.resolve(__dirname, '../src/lib/rules'));

  const rules = Object.keys(allRules)
    .filter(key => !!allRules[key].meta.docs.recommended)
    .reduce((config, key) => {
      // having this here is just for output niceness (the keys will be ordered)
      if (bannedRecommendedRules.has(key)) {
        console.log(key.padEnd(MAX_RULE_NAME_LENGTH), '= off');
        config[key] = 'off';
      }

      const ruleName = `typescript/${key}`;
      const setting = allRules[key].meta.docs.recommended;

      if (!['error', 'warn'].includes(setting)) {
        console.log(`ERR! Invalid level for rule ${key}: "${setting}"`);
        // Don't want to throw an error since ^ explains what happened.
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }

      console.log(ruleName.padEnd(MAX_RULE_NAME_LENGTH), '=', setting);
      config[ruleName] = setting;

      return config;
    }, {});

  const filePath = path.resolve(__dirname, '../src/configs/recommended.json');

  const recommendedConfig = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      sourceType: 'module'
    },
    plugins: ['typescript'],
    rules
  };

  fs.writeFileSync(filePath, `${JSON.stringify(recommendedConfig, null, 4)}\n`);
}

generate();
