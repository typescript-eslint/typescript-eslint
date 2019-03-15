/* eslint-disable no-console */

import path from 'path';
import fs from 'fs';
import requireIndex from 'requireindex';
import RuleModule from 'ts-eslint';

const bannedRecommendedRules = new Set([
  'camelcase',
  'indent',
  'no-array-constructor',
  'no-unused-vars',
]);
const MAX_RULE_NAME_LENGTH = 40 + 'typescript/'.length;

function padEnd(str: string, length: number): string {
  while (str.length < length) {
    str += ' ';
  }
  return str;
}

/**
 * Generate recommended configuration
 */
function generate(): void {
  // replace this with Object.entries when node > 8
  const allRules: Record<
    string,
    { default: RuleModule<any, any> }
  > = requireIndex(path.resolve(__dirname, '../dist/rules'));

  const rules = Object.keys(allRules)
    .map(key => ({ ...allRules[key].default, name: key }))
    .filter(rule => {
      return !!rule.meta.docs.recommended;
    })
    .reduce<Record<string, string>>((config, rule) => {
      // having this here is just for output niceness (the keys will be ordered)
      if (bannedRecommendedRules.has(rule.name)) {
        console.log(padEnd(rule.name, MAX_RULE_NAME_LENGTH), '= off');
        config[rule.name] = 'off';
      }

      const ruleName = `@typescript-eslint/${rule.name}`;
      const setting = rule.meta.docs.recommended as string;

      config[ruleName] = setting;
      console.log(padEnd(ruleName, MAX_RULE_NAME_LENGTH), '=', setting);

      return config;
    }, {});

  const filePath = path.resolve(__dirname, '../src/configs/recommended.json');

  const recommendedConfig = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules,
  };

  fs.writeFileSync(filePath, `${JSON.stringify(recommendedConfig, null, 4)}\n`);
}

generate();
