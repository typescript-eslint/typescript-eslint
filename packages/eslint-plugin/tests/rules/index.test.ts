import * as fs from 'node:fs/promises';
import path from 'node:path';

import rules from '../../src/rules';

describe('./src/rules/index.ts', async () => {
  const ruleNames = Object.keys(rules)
    .map(name => `${name}.ts`)
    .sort();
  const files = (
    await fs.readdir(path.join(__dirname, '..', '..', 'src', 'rules'), {
      encoding: 'utf-8',
    })
  ).filter(file => file !== 'index.ts' && file.endsWith('.ts'));

  it('imports all available rule modules', () => {
    expect(ruleNames).toStrictEqual(files);
  });
});
