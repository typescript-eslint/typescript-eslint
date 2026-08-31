import * as fs from 'node:fs';
import * as path from 'node:path';

import { nodeIntegrationTest } from '../tools/integration-test-base';
import { FIXTURES_DESTINATION_DIR } from '../tools/pack-packages';

const expectedDiagnostics = [
  {
    column: 1,
    endColumn: 13,
    endLine: 4,
    line: 4,
    ruleId: '@typescript-eslint/no-unsafe-unary-minus',
  },
  {
    column: 13,
    endColumn: 21,
    endLine: 5,
    line: 5,
    ruleId: '@typescript-eslint/no-unsafe-argument',
  },
  {
    column: 1,
    endColumn: 8,
    endLine: 6,
    line: 6,
    ruleId: '@typescript-eslint/await-thenable',
  },
  {
    column: 1,
    endColumn: 19,
    endLine: 7,
    line: 7,
    ruleId: '@typescript-eslint/no-deprecated',
  },
];

nodeIntegrationTest(__filename, 'lint.mjs', stderr => {
  expect(JSON.parse(stderr)).toStrictEqual(expectedDiagnostics);

  const packageJson = JSON.parse(
    fs.readFileSync(
      path.join(
        FIXTURES_DESTINATION_DIR,
        'native-project-service/package.json',
      ),
      'utf8',
    ),
  ) as { devDependencies: Record<string, string> };

  expect(packageJson.devDependencies['@typescript/native']).toBe(
    'npm:typescript@7.1.0-dev.20260822.1',
  );
  expect(packageJson.devDependencies.typescript).toBe(
    'npm:@typescript/typescript6@6.0.2',
  );
});

nodeIntegrationTest(__filename, 'lifecycle.mjs', stderr => {
  expect(JSON.parse(stderr)).toStrictEqual([
    ['@typescript-eslint/no-unsafe-unary-minus'],
    ['@typescript-eslint/await-thenable'],
  ]);
});
