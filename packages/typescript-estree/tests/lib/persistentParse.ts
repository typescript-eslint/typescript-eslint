import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { clearCaches, parseAndGenerateServices } from '../../src';

const CONTENTS = {
  foo: 'console.log("foo")',
  bar: 'console.log("bar")',
  'baz/bar': 'console.log("baz bar")',
  'bat/baz/bar': 'console.log("bat/baz/bar")',
  number: 'const foo = 1;',
  object: '(() => { })();',
  string: 'let a: "a" | "b";',
};

const cwdCopy = process.cwd();
const tmpDirs = new Set<tmp.DirResult>();
afterEach(() => {
  // stop watching the files and folders
  clearCaches();

  // clean up the temporary files and folders
  tmpDirs.forEach(t => t.removeCallback());
  tmpDirs.clear();

  // restore original cwd
  process.chdir(cwdCopy);
});

function writeTSConfig(dirName: string, config: Record<string, unknown>): void {
  fs.writeFileSync(path.join(dirName, 'tsconfig.json'), JSON.stringify(config));
}
function writeFile(dirName: string, file: keyof typeof CONTENTS): void {
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

function parseFile(
  filename: keyof typeof CONTENTS,
  tmpDir: string,
  relative?: boolean,
  ignoreTsconfigRootDir?: boolean,
): void {
  parseAndGenerateServices(CONTENTS[filename], {
    project: './tsconfig.json',
    tsconfigRootDir: ignoreTsconfigRootDir ? undefined : tmpDir,
    filePath: relative
      ? path.join('src', `${filename}.ts`)
      : path.join(tmpDir, 'src', `${filename}.ts`),
  });
}

function existsSync(filename: keyof typeof CONTENTS, tmpDir = ''): boolean {
  return fs.existsSync(path.join(tmpDir, 'src', `${filename}.ts`));
}

function baseTests(
  tsConfigExcludeBar: Record<string, unknown>,
  tsConfigIncludeAll: Record<string, unknown>,
): void {
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
    const bazSlashBar = path.join('baz', 'bar') as 'baz/bar';

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, bazSlashBar);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).not.toThrow();
  });

  it('allows parsing of deeply nested new files in new folder', () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll);

    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();

    // Create deep folder structure after first parse (this is important step)
    // context: https://github.com/typescript-eslint/typescript-eslint/issues/1394
    fs.mkdirSync(path.join(PROJECT_DIR, 'src', 'bat'));
    fs.mkdirSync(path.join(PROJECT_DIR, 'src', 'bat', 'baz'));

    const bazSlashBar = path.join('bat', 'baz', 'bar') as 'bat/baz/bar';

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, bazSlashBar);

    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).not.toThrow();
  });

  it('allows renaming of files', () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll, true);
    const bazSlashBar = path.join('baz', 'bar') as 'baz/bar';

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).toThrow();

    // write a new file and attempt to parse it
    renameFile(PROJECT_DIR, 'bar', bazSlashBar);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
    expect(() => parseFile(bazSlashBar, PROJECT_DIR)).not.toThrow();
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

  it('should work with relative paths', () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll, false);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR, true)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('bar', PROJECT_DIR, true)).toThrow();

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, 'bar');

    // make sure that file is correctly created
    expect(existsSync('bar', PROJECT_DIR)).toEqual(true);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR, true)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR, true)).not.toThrow();
  });

  it('should work with relative paths without tsconfig root', () => {
    const PROJECT_DIR = setup(tsConfigIncludeAll, false);
    process.chdir(PROJECT_DIR);

    // parse once to: assert the config as correct, and to make sure the program is setup
    expect(() => parseFile('foo', PROJECT_DIR, true, true)).not.toThrow();
    // bar should throw because it doesn't exist yet
    expect(() => parseFile('bar', PROJECT_DIR, true, true)).toThrow();

    // write a new file and attempt to parse it
    writeFile(PROJECT_DIR, 'bar');

    // make sure that file is correctly created
    expect(existsSync('bar')).toEqual(true);
    expect(existsSync('bar', PROJECT_DIR)).toEqual(true);

    // both files should parse fine now
    expect(() => parseFile('foo', PROJECT_DIR, true, true)).not.toThrow();
    expect(() => parseFile('bar', PROJECT_DIR, true, true)).not.toThrow();
  });
}

describe('persistent parse', () => {
  describe('includes not ending in a slash', () => {
    const tsConfigExcludeBar = {
      include: ['src'],
      exclude: ['./src/bar.ts'],
    };
    const tsConfigIncludeAll = {
      include: ['src'],
      exclude: [],
    };

    baseTests(tsConfigExcludeBar, tsConfigIncludeAll);
  });

  /*
  If the includes ends in a slash, typescript will ask for watchers ending in a slash.
  These tests ensure the normalization of code works as expected in this case.
  */
  describe('includes ending in a slash', () => {
    const tsConfigExcludeBar = {
      include: ['src/'],
      exclude: ['./src/bar.ts'],
    };
    const tsConfigIncludeAll = {
      include: ['src/'],
      exclude: [],
    };

    baseTests(tsConfigExcludeBar, tsConfigIncludeAll);
  });

  /*
  If there is no includes, then typescript will ask for a slightly different set of watchers.
  */
  describe('tsconfig with no includes / files', () => {
    const tsConfigExcludeBar = {
      exclude: ['./src/bar.ts'],
    };
    const tsConfigIncludeAll = {};

    baseTests(tsConfigExcludeBar, tsConfigIncludeAll);

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
      const bazSlashBar = path.join('baz', 'bar') as 'baz/bar';

      // parse once to: assert the config as correct, and to make sure the program is setup
      expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
      expect(() => parseFile(bazSlashBar, PROJECT_DIR)).toThrow();

      // write a new file and attempt to parse it
      writeFile(PROJECT_DIR, bazSlashBar);

      expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
      expect(() => parseFile(bazSlashBar, PROJECT_DIR)).not.toThrow();
    });
  });

  /*
  If there is no includes, then typescript will ask for a slightly different set of watchers.
  */
  describe('tsconfig with overlapping globs', () => {
    const tsConfigExcludeBar = {
      include: ['./*', './**/*', './src/**/*'],
      exclude: ['./src/bar.ts'],
    };
    const tsConfigIncludeAll = {
      include: ['./*', './**/*', './src/**/*'],
    };

    baseTests(tsConfigExcludeBar, tsConfigIncludeAll);
  });

  describe('tsconfig with module set', () => {
    const moduleTypes = [
      'None',
      'CommonJS',
      'AMD',
      'System',
      'UMD',
      'ES6',
      'ES2015',
      'ESNext',
    ];

    for (const module of moduleTypes) {
      describe(`module ${module}`, () => {
        const tsConfigIncludeAll = {
          compilerOptions: { module },
          include: ['./**/*'],
        };

        const testNames = ['object', 'number', 'string', 'foo'] as const;
        for (const name of testNames) {
          it(`first parse of ${name} should not throw`, () => {
            const PROJECT_DIR = setup(tsConfigIncludeAll);
            writeFile(PROJECT_DIR, name);
            expect(() => parseFile(name, PROJECT_DIR)).not.toThrow();
          });
        }
      });
    }
  });
});
