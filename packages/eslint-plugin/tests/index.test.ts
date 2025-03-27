import fs from 'node:fs';
import path from 'node:path';

import eslintPlugin from '../src/index';
import rules from '../src/rules';

describe('eslint-plugin ("./src/index.ts")', () => {
  const ruleKeys = Object.keys(rules);
  const eslintPluginRuleKeys = Object.keys(eslintPlugin.rules);

  const eslintrcConfigs = fs
    .readdirSync('./src/configs/eslintrc')
    .filter(file => ['.json', '.ts'].includes(path.extname(file).toLowerCase()))
    .map(file => path.basename(file, path.extname(file)));

  const flatConfigs = fs
    .readdirSync('./src/configs/flat')
    .filter(file => ['.json', '.ts'].includes(path.extname(file).toLowerCase()))
    .map(file => path.basename(file, path.extname(file)))
    .map(file => `flat/${file}`);

  const eslintPluginConfigKeys = Object.keys(eslintPlugin.configs);

  it('exports all available rules', () => {
    expect(ruleKeys).toEqual(expect.arrayContaining(eslintPluginRuleKeys));
  });

  it('exports all available configs', () => {
    expect([
      ...eslintrcConfigs,
      // This config is deprecated and eventually will be removed
      'recommended-requiring-type-checking',
      ...flatConfigs,
    ]).toEqual(expect.arrayContaining(eslintPluginConfigKeys));
  });
});
