import fs from 'fs';
import path from 'path';
import tmp from 'tmp';

import type { TSESTreeOptions } from '../../src';
import { AST_NODE_TYPES, simpleTraverse } from '../../src';
import { clearWatchCaches } from '../../src/create-program/shared';
import type { ParseAndGenerateServicesResult } from '../../src/parser';
import { parseAndGenerateServices } from '../../src/parser';

const CONTENTS = {
  foo: {
    code: 'const x = "foo";',
    types: [
      [AST_NODE_TYPES.Program, 'any'],
      [AST_NODE_TYPES.VariableDeclaration, 'any'],
      [AST_NODE_TYPES.VariableDeclarator, '"foo"'],
      [AST_NODE_TYPES.Identifier, '"foo"'],
      [AST_NODE_TYPES.Literal, '"foo"'],
    ],
  },
  bar: {
    code: 'const x = "bar";',
    types: [
      [AST_NODE_TYPES.Program, 'any'],
      [AST_NODE_TYPES.VariableDeclaration, 'any'],
      [AST_NODE_TYPES.VariableDeclarator, '"bar"'],
      [AST_NODE_TYPES.Identifier, '"bar"'],
      [AST_NODE_TYPES.Literal, '"bar"'],
    ],
  },
  'baz/bar': {
    code: 'const x = "baz bar";',
    types: [
      [AST_NODE_TYPES.Program, 'any'],
      [AST_NODE_TYPES.VariableDeclaration, 'any'],
      [AST_NODE_TYPES.VariableDeclarator, '"baz bar"'],
      [AST_NODE_TYPES.Identifier, '"baz bar"'],
      [AST_NODE_TYPES.Literal, '"baz bar"'],
    ],
  },
  'bat/baz/bar': {
    code: 'const x = "bat/baz/bar";',
    types: [
      [AST_NODE_TYPES.Program, 'any'],
      [AST_NODE_TYPES.VariableDeclaration, 'any'],
      [AST_NODE_TYPES.VariableDeclarator, '"bat/baz/bar"'],
      [AST_NODE_TYPES.Identifier, '"bat/baz/bar"'],
      [AST_NODE_TYPES.Literal, '"bat/baz/bar"'],
    ],
  },
  number: {
    code: 'const foo = 1;',
    types: [
      [AST_NODE_TYPES.Program, 'any'],
      [AST_NODE_TYPES.VariableDeclaration, 'any'],
      [AST_NODE_TYPES.VariableDeclarator, '1'],
      [AST_NODE_TYPES.Identifier, '1'],
      [AST_NODE_TYPES.Literal, '1'],
    ],
  },
  object: {
    code: '(() => { })();',
    types: [
      [AST_NODE_TYPES.Program, 'any'],
      [AST_NODE_TYPES.ExpressionStatement, 'any'],
      [AST_NODE_TYPES.CallExpression, 'void'],
      [AST_NODE_TYPES.ArrowFunctionExpression, '() => void'],
      [AST_NODE_TYPES.BlockStatement, 'any'],
    ],
  },
  string: {
    code: 'let a: "a" | "b";',
    types: [
      [AST_NODE_TYPES.Program, 'any'],
      [AST_NODE_TYPES.VariableDeclaration, 'any'],
      [AST_NODE_TYPES.VariableDeclarator, '"a" | "b"'],
      [AST_NODE_TYPES.Identifier, '"a" | "b"'],
      [AST_NODE_TYPES.TSTypeAnnotation, 'any'],
      [AST_NODE_TYPES.TSUnionType, '"a" | "b"'],
      [AST_NODE_TYPES.TSLiteralType, '"a"'],
      [AST_NODE_TYPES.Literal, 'any'],
      [AST_NODE_TYPES.TSLiteralType, '"b"'],
      [AST_NODE_TYPES.Literal, 'any'],
    ],
  },
};

const cwdCopy = process.cwd();
const tmpDirs = new Set<tmp.DirResult>();
afterEach(() => {
  // stop watching the files and folders
  clearWatchCaches();
});
afterAll(() => {
  // clean up the temporary files and folders
  tmpDirs.forEach(t => t.removeCallback());
  tmpDirs.clear();

  // restore original cwd
  process.chdir(cwdCopy);
});

function parserTests(extraOptions: TSESTreeOptions): void {
  function writeTSConfig(
    dirName: string,
    config: Record<string, unknown>,
  ): void {
    fs.writeFileSync(
      path.join(dirName, 'tsconfig.json'),
      JSON.stringify(config),
    );
  }
  function writeFile(dirName: string, file: keyof typeof CONTENTS): void {
    fs.writeFileSync(
      path.join(dirName, 'src', `${file}.ts`),
      CONTENTS[file].code,
    );
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

  function parseFile({
    filename,
    ignoreTsconfigRootDir,
    relative,
    shouldThrowError,
    tmpDir,
  }: {
    filename: keyof typeof CONTENTS;
    ignoreTsconfigRootDir?: boolean;
    relative?: boolean;
    shouldThrowError?: boolean;
    tmpDir: string;
  }): void {
    describe(filename, () => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const result = ((): ParseAndGenerateServicesResult<{}> | Error => {
        try {
          return parseAndGenerateServices(CONTENTS[filename].code, {
            ...extraOptions,
            project: './tsconfig.json',
            tsconfigRootDir: ignoreTsconfigRootDir ? undefined : tmpDir,
            filePath: relative
              ? path.join('src', `${filename}.ts`)
              : path.join(tmpDir, 'src', `${filename}.ts`),
          });
        } catch (ex) {
          return ex as Error;
        }
      })();
      if (shouldThrowError === true) {
        it('should throw', () => {
          expect(result).toBeInstanceOf(Error);
          const message = (result as Error).message;
          expect(message).toMatch(
            new RegExp(`<tsconfigRootDir>/src/${filename}`),
          );
          expect(message).toMatch(/TSConfig does not include this file/);
        });
        return;
      } else {
        it('should not throw', () => {
          expect(result).not.toBeInstanceOf(Error);
        });
      }
      if (result instanceof Error) {
        // not possible to reach
        return;
      }

      it('should have full type information available for nodes', () => {
        expect(result.services.hasFullTypeInformation).toBeTruthy();
        const checker = result.services.program.getTypeChecker();
        const types: Array<[AST_NODE_TYPES, string]> = [];
        simpleTraverse(result.ast, {
          enter(node) {
            const type = checker.getTypeAtLocation(
              result.services.esTreeNodeToTSNodeMap.get(node),
            );
            types.push([node.type, checker.typeToString(type)]);
          },
        });
        expect(types).toStrictEqual(CONTENTS[filename].types);
      });
    });
  }

  function existsSync(filename: keyof typeof CONTENTS, tmpDir = ''): boolean {
    return fs.existsSync(path.join(tmpDir, 'src', `${filename}.ts`));
  }

  function baseTests(
    tsConfigExcludeBar: Record<string, unknown>,
    tsConfigIncludeAll: Record<string, unknown>,
  ): void {
    describe('parses both files successfully when included', () => {
      const PROJECT_DIR = setup(tsConfigIncludeAll);

      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        filename: 'bar',
        tmpDir: PROJECT_DIR,
      });
    });

    describe('parses included files, and throws on excluded files', () => {
      const PROJECT_DIR = setup(tsConfigExcludeBar);

      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        shouldThrowError: true,
        filename: 'bar',
        tmpDir: PROJECT_DIR,
      });
    });

    describe('allows parsing of new files', () => {
      const PROJECT_DIR = setup(tsConfigIncludeAll, false);

      // parse once to: assert the config as correct, and to make sure the program is setup
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      // bar should throw because it doesn't exist yet
      parseFile({
        shouldThrowError: true,
        filename: 'bar',
        tmpDir: PROJECT_DIR,
      });

      // write a new file and attempt to parse it
      writeFile(PROJECT_DIR, 'bar');

      // both files should parse fine now
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        filename: 'bar',
        tmpDir: PROJECT_DIR,
      });
    });

    describe('allows parsing of deeply nested new files', () => {
      const PROJECT_DIR = setup(tsConfigIncludeAll, false);
      const bazSlashBar = 'baz/bar' as const;

      // parse once to: assert the config as correct, and to make sure the program is setup
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      // bar should throw because it doesn't exist yet
      parseFile({
        shouldThrowError: true,
        filename: bazSlashBar,
        tmpDir: PROJECT_DIR,
      });

      // write a new file and attempt to parse it
      writeFile(PROJECT_DIR, bazSlashBar);

      // both files should parse fine now
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        filename: bazSlashBar,
        tmpDir: PROJECT_DIR,
      });
    });

    describe('allows parsing of deeply nested new files in new folder', () => {
      const PROJECT_DIR = setup(tsConfigIncludeAll);

      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });

      // Create deep folder structure after first parse (this is important step)
      // context: https://github.com/typescript-eslint/typescript-eslint/issues/1394
      fs.mkdirSync(path.join(PROJECT_DIR, 'src', 'bat'));
      fs.mkdirSync(path.join(PROJECT_DIR, 'src', 'bat', 'baz'));

      const bazSlashBar = 'bat/baz/bar' as const;

      // write a new file and attempt to parse it
      writeFile(PROJECT_DIR, bazSlashBar);

      parseFile({
        filename: bazSlashBar,
        tmpDir: PROJECT_DIR,
      });
    });

    describe('allows renaming of files', () => {
      const PROJECT_DIR = setup(tsConfigIncludeAll, true);
      const bazSlashBar = 'baz/bar' as const;

      // parse once to: assert the config as correct, and to make sure the program is setup
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      // bar should throw because it doesn't exist yet
      parseFile({
        shouldThrowError: true,
        filename: bazSlashBar,
        tmpDir: PROJECT_DIR,
      });

      // write a new file and attempt to parse it
      renameFile(PROJECT_DIR, 'bar', bazSlashBar);

      // both files should parse fine now
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        filename: bazSlashBar,
        tmpDir: PROJECT_DIR,
      });
    });

    describe('reacts to changes in the tsconfig', () => {
      const PROJECT_DIR = setup(tsConfigExcludeBar);

      // parse once to: assert the config as correct, and to make sure the program is setup
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        shouldThrowError: true,
        filename: 'bar',
        tmpDir: PROJECT_DIR,
      });

      // change the config file so it now includes all files
      writeTSConfig(PROJECT_DIR, tsConfigIncludeAll);

      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        filename: 'bar',
        tmpDir: PROJECT_DIR,
      });
    });

    describe('should work with relative paths', () => {
      const PROJECT_DIR = setup(tsConfigIncludeAll, false);

      // parse once to: assert the config as correct, and to make sure the program is setup
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
        relative: true,
      });
      // bar should throw because it doesn't exist yet
      parseFile({
        shouldThrowError: true,
        filename: 'bar',
        tmpDir: PROJECT_DIR,
        relative: true,
      });

      // write a new file and attempt to parse it
      writeFile(PROJECT_DIR, 'bar');

      // make sure that file is correctly created
      expect(existsSync('bar', PROJECT_DIR)).toBe(true);

      // both files should parse fine now
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
        relative: true,
      });
      parseFile({
        filename: 'bar',
        tmpDir: PROJECT_DIR,
        relative: true,
      });
    });

    describe('should work with relative paths without tsconfig root', () => {
      const PROJECT_DIR = setup(tsConfigIncludeAll, false);
      process.chdir(PROJECT_DIR);

      // parse once to: assert the config as correct, and to make sure the program is setup
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
        relative: true,
        ignoreTsconfigRootDir: true,
      });
      // bar should throw because it doesn't exist yet
      parseFile({
        shouldThrowError: true,
        filename: 'bar',
        tmpDir: PROJECT_DIR,
        relative: true,
        ignoreTsconfigRootDir: true,
      });

      // write a new file and attempt to parse it
      writeFile(PROJECT_DIR, 'bar');

      // make sure that file is correctly created
      expect(existsSync('bar')).toBe(true);
      expect(existsSync('bar', PROJECT_DIR)).toBe(true);

      // both files should parse fine now
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
        relative: true,
        ignoreTsconfigRootDir: true,
      });
      parseFile({
        filename: 'bar',
        tmpDir: PROJECT_DIR,
        relative: true,
        ignoreTsconfigRootDir: true,
      });
    });
  }

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

    describe('handles tsconfigs with no includes/excludes (single level)', () => {
      const PROJECT_DIR = setup({}, false);

      // parse once to: assert the config as correct, and to make sure the program is setup
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        shouldThrowError: true,
        filename: 'bar',
        tmpDir: PROJECT_DIR,
      });

      // write a new file and attempt to parse it
      writeFile(PROJECT_DIR, 'bar');

      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        filename: 'bar',
        tmpDir: PROJECT_DIR,
      });
    });

    describe('handles tsconfigs with no includes/excludes (nested)', () => {
      const PROJECT_DIR = setup({}, false);
      const bazSlashBar = 'baz/bar' as const;

      // parse once to: assert the config as correct, and to make sure the program is setup
      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        shouldThrowError: true,
        filename: bazSlashBar,
        tmpDir: PROJECT_DIR,
      });

      // write a new file and attempt to parse it
      writeFile(PROJECT_DIR, bazSlashBar);

      parseFile({
        filename: 'foo',
        tmpDir: PROJECT_DIR,
      });
      parseFile({
        filename: bazSlashBar,
        tmpDir: PROJECT_DIR,
      });
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
          describe(`first parse of ${name} should not throw`, () => {
            const PROJECT_DIR = setup(tsConfigIncludeAll);
            writeFile(PROJECT_DIR, name);
            parseFile({
              filename: name,
              tmpDir: PROJECT_DIR,
            });
          });
        }
      });
    }
  });
}

describe('persistent parse', () => {
  describe('Builder Program', () => {
    parserTests({ EXPERIMENTAL_useLanguageService: false });
  });
  describe('Language Service', () => {
    parserTests({ EXPERIMENTAL_useLanguageService: true });
  });
});
