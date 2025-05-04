import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import eslintPlugin from '../src/index.js';
import rules from '../src/rules/index.js';

describe('eslint-plugin ("./src/index.ts")', async () => {
  const CONFIGS_DIR = path.join(__dirname, '..', 'src', 'configs');

  const ruleKeys = Object.keys(rules);
  const eslintPluginRuleKeys = Object.keys(eslintPlugin.rules);

  const eslintrcConfigs = (
    await fs.readdir(path.join(CONFIGS_DIR, 'eslintrc'), {
      encoding: 'utf-8',
    })
  )
    .filter(file => ['.json', '.ts'].includes(path.extname(file).toLowerCase()))
    .map(file => path.basename(file, path.extname(file)));

  const flatConfigs = (
    await fs.readdir(path.join(CONFIGS_DIR, 'flat'), {
      encoding: 'utf-8',
    })
  )
    .filter(file => ['.json', '.ts'].includes(path.extname(file).toLowerCase()))
    .map(file => path.basename(file, path.extname(file)))
    .map(file => `flat/${file}`);

  const eslintPluginConfigKeys = Object.keys(eslintPlugin.configs);

  it('exports all available rules', () => {
    expect(ruleKeys).toStrictEqual(
      expect.arrayContaining(eslintPluginRuleKeys),
    );
  });

  it('exports all available configs', () => {
    expect([
      ...eslintrcConfigs,
      // This config is deprecated and eventually will be removed
      'recommended-requiring-type-checking',
      ...flatConfigs,
    ]).toStrictEqual(expect.arrayContaining(eslintPluginConfigKeys));
  });
});
