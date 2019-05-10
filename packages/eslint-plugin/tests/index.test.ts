import fs from 'fs';

import eslintPlugin from '../src';
import rules from '../src/rules';

describe('eslint-plugin ("./src/index.ts")', () => {
  const ruleKeys = Object.keys(rules);
  const eslintPluginRuleKeys = Object.keys(eslintPlugin.rules);
  const manualConfigs = ['eslintRecommended'];

  const configs = fs
    .readdirSync('./src/configs')
    .filter(file => file.endsWith('.json'));
  const eslintPluginConfigKeys = Object.keys(eslintPlugin.configs)
    .filter(key => !manualConfigs.includes(key))
    .map(key => `${key}.json`);

  it('exports all available rules', () => {
    expect(ruleKeys).toEqual(expect.arrayContaining(eslintPluginRuleKeys));
  });

  it('exports all available generated configs', () => {
    expect(configs).toEqual(expect.arrayContaining(eslintPluginConfigKeys));
  });
});
