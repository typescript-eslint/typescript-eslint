import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { parseAndGenerateServices } from '../../src/parser';
import { clearCaches } from '../../src/tsconfig-parser';

const tsConfigExcludeBar = {
  include: ['./*.ts'],
  exclude: ['./bar.ts'],
};
const tsConfigIncludeAll = {
  include: ['./*.ts'],
  exclude: [],
};
const CONTENTS = {
  foo: 'console.log("foo")',
  bar: 'console.log("bar")',
};

const tmpDirs = new Set<tmp.DirResult>();
afterEach(() => {
  // stop watching the files and folders
  clearCaches();

  // clean up the temporary files and folders
  tmpDirs.forEach(t => t.removeCallback());
  tmpDirs.clear();
});

function writeTSConfig(
  dirName: string,
  config: Record<string, string[]>,
): void {
  fs.writeFileSync(path.join(dirName, 'tsconfig.json'), JSON.stringify(config));
}
function writeFile(dirName: string, file: 'foo' | 'bar'): void {
  fs.writeFileSync(path.join(dirName, `${file}.ts`), CONTENTS[file]);
}

function setup(tsconfig: Record<string, string[]>, writeBar = true): string {
  const tmpDir = tmp.dirSync({
    keep: false,
    unsafeCleanup: true,
  });
  tmpDirs.add(tmpDir);

  writeTSConfig(tmpDir.name, tsconfig);

  writeFile(tmpDir.name, 'foo');
  writeBar && writeFile(tmpDir.name, 'bar');

  return tmpDir.name;
}

function parseFile(filename: 'foo' | 'bar', tmpDir: string): void {
  parseAndGenerateServices(CONTENTS.foo, {
    project: './tsconfig.json',
    tsconfigRootDir: tmpDir,
    filePath: path.join(tmpDir, `${filename}.ts`),
  });
}

// https://github.com/microsoft/TypeScript/blob/a4bacf3bfaf77213c1ef4ddecaf3689837e20ac5/src/compiler/sys.ts#L46-L50
enum PollingInterval {
  High = 2000,
  Medium = 500,
  Low = 250,
}
async function runTimer(interval: PollingInterval): Promise<void> {
  // would love to use jest fake timers, but ts stores references to the standard timeout functions
  // so we can't switch to fake timers on the fly :(
  await new Promise((resolve): void => {
    setTimeout(resolve, interval);
  });
}
async function waitForChokidar(): Promise<void> {
  // wait for chokidar to be ready
  // this isn't won't be a problem when running the eslint CLI in watch mode because the init takes a few hundred ms
  await runTimer(PollingInterval.Medium);
}

describe('persistent lint session', () => {
  it('parses both files successfully when included', () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll);

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });

  it('parses included files, and throws on excluded files', () => {
    const PROJECT_DIR = setup(tsConfigExcludeBar);

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();
  });

  it('reacts to changes in the tsconfig', async () => {
    const PROJECT_DIR = setup(tsConfigExcludeBar);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();

    await waitForChokidar();

    // change the config file so it now includes all files
    writeTSConfig(PROJECT_DIR, tsConfigIncludeAll);

    // wait for TS to pick up the change to the config file
    await runTimer(PollingInterval.High);

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });

  it('allows parsing of new files', async () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll, false);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();

    await waitForChokidar();

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, 'bar');

    // wait for TS to pick up the new file
    await runTimer(PollingInterval.Medium);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });
});
