import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { clearCaches, parseAndGenerateServices } from '../../src/parser';

const tsConfigExcludeBar = {
  include: ['src'],
  exclude: ['./src/bar.ts'],
};
const tsConfigIncludeAll = {
  include: ['src'],
  exclude: [],
};
const CONTENTS = {
  foo: 'console.log("foo")',
  bar: 'console.log("bar")',
  'baz/bar': 'console.log("baz bar")',
};

const tmpDirs = new Set<tmp.DirResult>();
afterEach(() => {
  // stop watching the files and folders
  clearCaches();

  // clean up the temporary files and folders
  tmpDirs.forEach(t => t.removeCallback());
  tmpDirs.clear();
});

function writeTSConfig(dirName: string, config: Record<string, unknown>): void {
  fs.writeFileSync(path.join(dirName, 'tsconfig.json'), JSON.stringify(config));
}
function writeFile(dirName: string, file: 'foo' | 'bar' | 'baz/bar'): void {
  fs.writeFileSync(path.join(dirName, 'src', `${file}.ts`), CONTENTS[file]);
}
function renameFile(dirName: string, src: 'bar', dest: 'baz/bar'): void {
  fs.renameSync(
    path.join(dirName, 'src', `${src}.ts`),
    path.join(dirName, 'src', `${dest}.ts`),
  );
}

function createTmpDir(): tmp.DirResult {
  const tmpDir = tmp.dirSync({
    keep: false,
    unsafeCleanup: true,
  });
  tmpDirs.add(tmpDir);
  return tmpDir;
}
function setup(tsconfig: Record<string, unknown>, writeBar = true): string {
  const tmpDir = createTmpDir();

  writeTSConfig(tmpDir.name, tsconfig);

  fs.mkdirSync(path.join(tmpDir.name, 'src'));
  fs.mkdirSync(path.join(tmpDir.name, 'src', 'baz'));
  writeFile(tmpDir.name, 'foo');
  writeBar && writeFile(tmpDir.name, 'bar');

  return tmpDir.name;
}

function parseFile(filename: 'foo' | 'bar' | 'baz/bar', tmpDir: string): void {
  parseAndGenerateServices(CONTENTS.foo, {
    project: './tsconfig.json',
    tsconfigRootDir: tmpDir,
    filePath: path.join(tmpDir, 'src', `${filename}.ts`),
  });
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

  it('allows parsing of new files', () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll, false);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, 'bar');

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });

  it('allows parsing of deeply nested new files', () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll, false);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('baz/bar', PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, 'baz/bar');

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('baz/bar', PROJECT_DIR)).not.toThrow();
  });

  it('allows renaming of files', () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll, true);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('baz/bar', PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    renameFile(PROJECT_DIR, 'bar', 'baz/bar');

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('baz/bar', PROJECT_DIR)).not.toThrow();
  });

  it('reacts to changes in the tsconfig', () => {
    const PROJECT_DIR = setup(tsConfigExcludeBar);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();

    // change the config file so it now includes all files
    writeTSConfig(PROJECT_DIR, tsConfigIncludeAll);

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });

  it('handles tsconfigs with no includes/excludes (single level)', () => {
    const PROJECT_DIR = setup({}, false);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, 'bar');

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
  });

  it('handles tsconfigs with no includes/excludes (nested)', () => {
    const PROJECT_DIR = setup({}, false);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('baz/bar', PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, 'baz/bar');

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile('baz/bar', PROJECT_DIR)).not.toThrow();
  });

  // TODO - support the complex monorepo case with a tsconfig with no include/exclude
});
