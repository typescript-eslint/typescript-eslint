import fs from 'node:fs/promises';
import * as os from 'node:os';
import path from 'node:path';

import { clearCaches } from '../../src/clear-caches';
import { parseAndGenerateServices } from '../../src/parser';

const CODE = 'export const value = 1;';
const isWindows = process.platform === 'win32';

const tmpDirsParentDirectory = path.join(
  os.tmpdir(),
  'typescript-estree-case-insensitive-paths',
);

beforeAll(async () => {
  await fs.mkdir(tmpDirsParentDirectory, { recursive: true });
});

afterEach(() => {
  clearCaches();
});

afterAll(async () => {
  await fs.rm(tmpDirsParentDirectory, { recursive: true });
});

describe('case-insensitive file systems', () => {
  // https://github.com/typescript-eslint/typescript-eslint/issues/3966
  it.runIf(isWindows)(
    'finds the project when its directory name contains a character whose lowercase form is longer',
    async () => {
      const tmpDir = await fs.realpath(
        await fs.mkdtemp(path.join(tmpDirsParentDirectory, 'project-')),
      );
      const projectDir = path.join(tmpDir, 'GAİN');

      await fs.mkdir(projectDir);
      await fs.writeFile(path.join(projectDir, 'file.ts'), CODE, 'utf-8');
      await fs.writeFile(
        path.join(projectDir, 'tsconfig.json'),
        JSON.stringify({ include: ['file.ts'] }),
        'utf-8',
      );

      const result = parseAndGenerateServices(CODE, {
        disallowAutomaticSingleRunInference: true,
        filePath: path.join(projectDir, 'file.ts'),
        project: ['./GAİN/tsconfig.json'],
        projectService: false,
        tsconfigRootDir: tmpDir,
      });

      expect(result.services.program).toBeDefined();
    },
  );
});
