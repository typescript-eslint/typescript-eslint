import fs from 'node:fs/promises';
import * as os from 'node:os';
import path from 'node:path';

import { clearCaches } from '../../src/clear-caches';
import { clearWatchCaches } from '../../src/create-program/getWatchProgramsForProjects';
import {
  clearDefaultProjectMatchedFiles,
  parseAndGenerateServices,
} from '../../src/parser';

export const CONTENTS = {
  bar: 'console.log("bar")',
  'bat/baz/bar': 'console.log("bat/baz/bar")',
  'baz/bar': 'console.log("baz bar")',
  foo: 'console.log("foo")',
  number: 'const foo = 1;',
  object: '(() => { })();',
  string: 'let a: "a" | "b";',
};

const homeOrTmpDir = os.tmpdir() || os.homedir();

let tmpDirsParentDirectory: string;

/**
 * Registers the hooks every persistent parse test file needs.
 */
export function setupPersistentParseTests(): void {
  const cwdCopy = process.cwd();

  afterEach(() => {
    // reset project tracking
    clearDefaultProjectMatchedFiles();

    // stop watching the files and folders
    clearWatchCaches();

    // restore original cwd
    process.chdir(cwdCopy);
  });

  beforeEach(() => {
    vi.stubEnv(
      'TYPESCRIPT_ESLINT_IGNORE_PROJECT_AND_PROJECT_SERVICE_ERROR',
      'true',
    );
  });

  beforeAll(async () => {
    tmpDirsParentDirectory = await fs.mkdtemp(
      path.join(homeOrTmpDir, 'typescript-estree-'),
    );
  });

  afterAll(async () => {
    // clean up the temporary files and folders
    await fs.rm(tmpDirsParentDirectory, { recursive: true });
  });
}

async function writeTSConfig(
  dirName: string,
  config: Record<string, unknown>,
): Promise<void> {
  await fs.writeFile(
    path.join(dirName, 'tsconfig.json'),
    JSON.stringify(config, null, 2),
    { encoding: 'utf-8' },
  );
}

export async function writeFile(
  dirName: string,
  file: keyof typeof CONTENTS,
): Promise<void> {
  await fs.writeFile(
    path.join(dirName, 'src', `${file}.ts`),
    CONTENTS[file],
    'utf-8',
  );
}

async function renameFile(
  dirName: string,
  src: 'bar',
  dest: 'baz/bar',
): Promise<void> {
  await fs.rename(
    path.join(dirName, 'src', `${src}.ts`),
    path.join(dirName, 'src', `${dest}.ts`),
  );
}

async function createTmpDir(): Promise<string> {
  return await fs.mkdtemp(`${tmpDirsParentDirectory}/`, {
    encoding: 'utf-8',
  });
}

export async function setup(
  tsconfig: Record<string, unknown>,
  writeBar = true,
): Promise<string> {
  const tmpDir = await createTmpDir();

  await writeTSConfig(tmpDir, tsconfig);

  await fs.mkdir(path.join(tmpDir, 'src'), { recursive: true });
  await fs.mkdir(path.join(tmpDir, 'src', 'baz'), { recursive: true });
  await writeFile(tmpDir, 'foo');
  if (writeBar) {
    await writeFile(tmpDir, 'bar');
  }

  return tmpDir;
}

export function parseFile(
  filename: keyof typeof CONTENTS,
  tmpDir: string,
  relative?: boolean,
  ignoreTsconfigRootDir?: boolean,
): void {
  parseAndGenerateServices(CONTENTS[filename], {
    disallowAutomaticSingleRunInference: true,
    filePath: relative
      ? path.join('src', `${filename}.ts`)
      : path.join(tmpDir, 'src', `${filename}.ts`),
    project: './tsconfig.json',
    tsconfigRootDir: ignoreTsconfigRootDir ? undefined : tmpDir,
  });
}

async function exists(
  filename: keyof typeof CONTENTS,
  tmpDir = '',
): Promise<boolean> {
  return (await fs.lstat(path.join(tmpDir, 'src', `${filename}.ts`))).isFile();
}

export function baseTests(
  tsConfigExcludeBar: Record<string, unknown>,
  tsConfigIncludeAll: Record<string, unknown>,
): void {
  it('parses both files successfully when included', async () => {
    const PROJECT_DIR = await setup(tsConfigIncludeAll);

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });

  it('parses included files, and throws on excluded files', async () => {
    const PROJECT_DIR = await setup(tsConfigExcludeBar);

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();
  });

  it('allows parsing of new files', async () => {
    const PROJECT_DIR = await setup(tsConfigIncludeAll, false);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    await writeFile(PROJECT_DIR, 'bar');

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });

  it('allows parsing of deeply nested new files', async () => {
    const PROJECT_DIR = await setup(tsConfigIncludeAll, false);
    const bazSlashBar = 'baz/bar';

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    await writeFile(PROJECT_DIR, bazSlashBar);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).not.toThrow();
  });

  it('allows parsing of deeply nested new files in new folder', async () => {
    const PROJECT_DIR = await setup(tsConfigIncludeAll);

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();

    // Create deep folder structure after first parse (this is important step)
    // context: https://github.com/typescript-eslint/typescript-eslint/issues/1394
    await fs.mkdir(path.join(PROJECT_DIR, 'src', 'bat'), { recursive: true });
    await fs.mkdir(path.join(PROJECT_DIR, 'src', 'bat', 'baz'), {
      recursive: true,
    });

    const bazSlashBar = 'bat/baz/bar';

    // write a new file and attempt to parse it
    await writeFile(PROJECT_DIR, bazSlashBar);

    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).not.toThrow();
  });

  it('allows renaming of files', async () => {
    const PROJECT_DIR = await setup(tsConfigIncludeAll, true);
    const bazSlashBar = 'baz/bar';

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    await renameFile(PROJECT_DIR, 'bar', bazSlashBar);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).not.toThrow();
  });

  it('reacts to changes in the tsconfig', async () => {
    const PROJECT_DIR = await setup(tsConfigExcludeBar);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();

    // change the config file so it now includes all files
    await writeTSConfig(PROJECT_DIR, tsConfigIncludeAll);
    clearCaches();

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });

  it('should work with relative paths', async () => {
    const PROJECT_DIR = await setup(tsConfigIncludeAll, false);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR, true)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('bar', PROJECT_DIR, true)).toThrow();

    // write a new file and attempt to parse it
    await writeFile(PROJECT_DIR, 'bar');

    // make sure that file is correctly created
    await expect(exists('bar', PROJECT_DIR)).resolves.toBe(true);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR, true)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR, true)).not.toThrow();
  });

  it('should work with relative paths without tsconfig root', async () => {
    const PROJECT_DIR = await setup(tsConfigIncludeAll, false);
    process.chdir(PROJECT_DIR);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR, true, true)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('bar', PROJECT_DIR, true, true)).toThrow();

    // write a new file and attempt to parse it
    await writeFile(PROJECT_DIR, 'bar');

    // make sure that file is correctly created
    await expect(exists('bar')).resolves.toBe(true);
    await expect(exists('bar', PROJECT_DIR)).resolves.toBe(true);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR, true, true)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR, true, true)).not.toThrow();
  });
}
