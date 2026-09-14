import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import * as os from 'node:os';
import path from 'node:path';

import { clearCaches } from '../../src/clear-caches';
import { parseAndGenerateServices } from '../../src/parser';

const CODE = 'export const value = 1;';
const directoryLinkType = process.platform === 'win32' ? 'junction' : 'dir';

const homeOrTmpDir = os.tmpdir() || os.homedir();
const tmpDirsParentDirectory = path.join(
  homeOrTmpDir,
  'typescript-estree-symlinks',
);

beforeAll(async () => {
  await fs.mkdir(tmpDirsParentDirectory, { recursive: true });
});

afterEach(() => {
  clearCaches();
  vi.restoreAllMocks();
});

afterAll(async () => {
  await fs.rm(tmpDirsParentDirectory, { recursive: true });
});

/**
 * Creates a project in which `libs` is reachable both directly and through the
 * `apps/app/libs` symlink. TypeScript only visits the directory once, so the
 * files under it are only in the project under `apps/app/libs`.
 */
async function createProjectWithSymlinkedDirectory(): Promise<string> {
  const tmpDir = await fs.realpath(
    await fs.mkdtemp(path.join(tmpDirsParentDirectory, 'symlinks-')),
  );

  await fs.mkdir(path.join(tmpDir, 'apps', 'app', 'src'), { recursive: true });
  await fs.mkdir(path.join(tmpDir, 'libs', 'lib', 'src'), { recursive: true });
  await fs.writeFile(
    path.join(tmpDir, 'apps', 'app', 'src', 'index.ts'),
    CODE,
    'utf-8',
  );
  await fs.writeFile(
    path.join(tmpDir, 'libs', 'lib', 'src', 'index.ts'),
    CODE,
    'utf-8',
  );
  await fs.symlink(
    path.join(tmpDir, 'libs'),
    path.join(tmpDir, 'apps', 'app', 'libs'),
    directoryLinkType,
  );
  await fs.writeFile(
    path.join(tmpDir, 'tsconfig.json'),
    JSON.stringify({ include: ['apps/**/*.ts', 'libs/**/*.ts'] }),
    'utf-8',
  );

  return tmpDir;
}

describe('symlinked directories', () => {
  it('returns a program when the file is only in the project under a symlinked path', async () => {
    const tmpDir = await createProjectWithSymlinkedDirectory();

    const result = parseAndGenerateServices(CODE, {
      disallowAutomaticSingleRunInference: true,
      filePath: path.join(tmpDir, 'libs', 'lib', 'src', 'index.ts'),
      project: ['./tsconfig.json'],
      projectService: false,
      tsconfigRootDir: tmpDir,
    });

    expect(result.services.program).toBeDefined();
  });

  it('returns a program when the file is linted through the symlinked path', async () => {
    const tmpDir = await createProjectWithSymlinkedDirectory();

    const result = parseAndGenerateServices(CODE, {
      disallowAutomaticSingleRunInference: true,
      filePath: path.join(
        tmpDir,
        'apps',
        'app',
        'libs',
        'lib',
        'src',
        'index.ts',
      ),
      project: ['./tsconfig.json'],
      projectService: false,
      tsconfigRootDir: tmpDir,
    });

    expect(result.services.program).toBeDefined();
  });

  it('returns a program when the file is linted through a symlinked project directory', async () => {
    const tmpDir = await createProjectWithSymlinkedDirectory();
    const linkedTmpDir = `${tmpDir}-link`;
    await fs.symlink(tmpDir, linkedTmpDir, directoryLinkType);

    const result = parseAndGenerateServices(CODE, {
      disallowAutomaticSingleRunInference: true,
      filePath: path.join(linkedTmpDir, 'apps', 'app', 'src', 'index.ts'),
      project: ['./tsconfig.json'],
      projectService: false,
      tsconfigRootDir: tmpDir,
    });

    expect(result.services.program).toBeDefined();
  });

  it('returns a program for a symlinked file when another file created the program', async () => {
    const tmpDir = await createProjectWithSymlinkedDirectory();
    const config = {
      disallowAutomaticSingleRunInference: true,
      project: ['./tsconfig.json'],
      projectService: false,
      tsconfigRootDir: tmpDir,
    } satisfies Parameters<typeof parseAndGenerateServices>[1];

    parseAndGenerateServices(CODE, {
      ...config,
      filePath: path.join(tmpDir, 'apps', 'app', 'src', 'index.ts'),
    });
    const result = parseAndGenerateServices(CODE, {
      ...config,
      filePath: path.join(tmpDir, 'libs', 'lib', 'src', 'index.ts'),
    });

    expect(result.services.program).toBeDefined();
  });

  it('rechecks a symlinked file after deletion invalidation', async () => {
    const tmpDir = await createProjectWithSymlinkedDirectory();
    const config = {
      disallowAutomaticSingleRunInference: true,
      project: ['./tsconfig.json'],
      projectService: false,
      tsconfigRootDir: tmpDir,
    } satisfies Parameters<typeof parseAndGenerateServices>[1];

    parseAndGenerateServices(CODE, {
      ...config,
      filePath: path.join(tmpDir, 'apps', 'app', 'src', 'index.ts'),
    });

    const newFilePath = path.join(tmpDir, 'libs', 'lib', 'src', 'new.ts');
    const existingFilePath = path.join(
      tmpDir,
      'libs',
      'lib',
      'src',
      'index.ts',
    );
    const symlinkedExistingFilePath = path.join(
      tmpDir,
      'apps',
      'app',
      'libs',
      'lib',
      'src',
      'index.ts',
    );
    const existsSync = fsSync.existsSync;
    let createdNewFile = false;
    // Simulate a rename occurring after the watch program's initial resync but
    // before its deletion check for the old, symlinked root file.
    vi.spyOn(fsSync, 'existsSync').mockImplementation(filePath => {
      if (
        !createdNewFile &&
        typeof filePath === 'string' &&
        path.normalize(filePath) === symlinkedExistingFilePath
      ) {
        fsSync.renameSync(existingFilePath, newFilePath);
        createdNewFile = true;
        return false;
      }
      return existsSync(filePath);
    });

    expect(() =>
      parseAndGenerateServices(CODE, {
        ...config,
        filePath: newFilePath,
      }),
    ).toThrow('However, that TSConfig does not include this file.');

    expect(createdNewFile).toBe(true);
  });

  it('returns a program when the project service is enabled and the file is only in the project under a symlinked path', async () => {
    const tmpDir = await createProjectWithSymlinkedDirectory();

    const result = parseAndGenerateServices(CODE, {
      filePath: path.join(tmpDir, 'libs', 'lib', 'src', 'index.ts'),
      projectService: true,
      tsconfigRootDir: tmpDir,
    });

    expect(result.services.program).toBeDefined();
  });

  it('returns a program when project is true and the file is only in the project under a symlinked path', async () => {
    const tmpDir = await createProjectWithSymlinkedDirectory();

    const result = parseAndGenerateServices(CODE, {
      disallowAutomaticSingleRunInference: true,
      filePath: path.join(tmpDir, 'libs', 'lib', 'src', 'index.ts'),
      project: true,
      projectService: false,
      tsconfigRootDir: tmpDir,
    });

    expect(result.services.program).toBeDefined();
  });
});
