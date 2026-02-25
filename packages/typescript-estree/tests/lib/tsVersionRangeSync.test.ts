import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'yaml';

import { SUPPORTED_TYPESCRIPT_VERSIONS } from '../../src/parseSettings/warnAboutTSVersion';

interface PnpmWorkspace {
  catalog: Record<string, string>;
}

it('The SUPPORTED_TYPESCRIPT_VERSIONS value must match the typescript dependency range declared in the pnpm catalog', async () => {
  const pnpmWorkspace = await fs.readFile(
    path.join(__dirname, '../../../../pnpm-workspace.yaml'),
    { encoding: 'utf-8' },
  );

  const { catalog }: PnpmWorkspace = yaml.parse(pnpmWorkspace);

  if (!catalog.typescript) {
    throw new Error('typescript not found in pnpm catalog');
  }

  expect(SUPPORTED_TYPESCRIPT_VERSIONS).toBe(catalog.typescript);
});
