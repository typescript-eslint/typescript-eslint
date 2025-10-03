import type { CacheDurationSeconds } from '@typescript-eslint/types';

import debug from 'debug';
import * as fastGlobModule from 'fast-glob';
import { join, resolve } from 'node:path';

import type { TSESTreeOptions } from '../../src/parser-options';

import * as parser from '../../src';
import * as sharedParserUtilsModule from '../../src/create-program/shared';
import { clearGlobResolutionCache } from '../../src/parseSettings/resolveProjectList';

const FIXTURES_DIR = join(__dirname, '..', 'fixtures', 'simpleProject');

vi.mock(import('../../src/create-program/shared.js'), async importOriginal => {
  const sharedActual = await importOriginal();

  return {
    ...sharedActual,
    __esModule: true,
    createDefaultCompilerOptionsFromExtra: vi.fn(
      sharedActual.createDefaultCompilerOptionsFromExtra,
    ),
  };
});

// Tests in CI by default run with lowercase program file names,
// resulting in path.relative results starting with many "../"s
vi.mock(import('typescript'), async importOriginal => {
  const ts = await importOriginal();

  return {
    ...ts,
    default: ts.default,
    sys: {
      ...ts.sys,
      useCaseSensitiveFileNames: true,
    },
  };
});

vi.mock('fast-glob', async importOriginal => {
  const fastGlob = await importOriginal<typeof fastGlobModule>();

  return {
    ...fastGlob,
    default: fastGlob.default,
    sync: vi.fn(fastGlob.sync),
  };
});

const createDefaultCompilerOptionsFromExtra = vi.mocked(
  sharedParserUtilsModule.createDefaultCompilerOptionsFromExtra,
);
const fastGlobSyncMock = vi.mocked(fastGlobModule.sync);

/**
 * Aligns paths between environments, node for windows uses `\`, for linux and mac uses `/`
 */
function alignErrorPath(error: Error): never {
  error.message = error.message.replaceAll(/\\(?!")/g, '/');
  throw error;
}

describe(parser.parseAndGenerateServices, () => {
  const hrtimeSpy = vi.spyOn(process, 'hrtime');

  beforeEach(() => {
    vi.clearAllMocks();
    clearGlobResolutionCache();
    vi.stubEnv(
      'TYPESCRIPT_ESLINT_IGNORE_PROJECT_AND_PROJECT_SERVICE_ERROR',
      'true',
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('preserveNodeMaps', () => {
    const code = 'var a = true';
    const baseConfig: TSESTreeOptions = {
      comment: true,
      filePath: 'file.ts',
      loc: true,
      range: true,
      tokens: true,
    };
    const projectConfig: TSESTreeOptions = {
      ...baseConfig,
      project: './tsconfig.json',
      tsconfigRootDir: FIXTURES_DIR,
    };

    it('should not impact the use of parse()', () => {
      const resultWithNoOptionSet = parser.parse(code, baseConfig);
      const resultWithOptionSetToTrue = parser.parse(code, {
        ...baseConfig,
        preserveNodeMaps: true,
      });
      const resultWithOptionSetToFalse = parser.parse(code, {
        ...baseConfig,
        preserveNodeMaps: false,
      });
      const resultWithOptionSetExplicitlyToUndefined = parser.parse(code, {
        ...baseConfig,
        preserveNodeMaps: undefined,
      });

      expect(resultWithNoOptionSet).toMatchObject(resultWithOptionSetToTrue);
      expect(resultWithNoOptionSet).toMatchObject(resultWithOptionSetToFalse);
      expect(resultWithNoOptionSet).toMatchObject(
        resultWithOptionSetExplicitlyToUndefined,
      );
    });

    it('should preserve node maps by default for parseAndGenerateServices()', () => {
      const noOptionSet = parser.parseAndGenerateServices(code, baseConfig);

      expect(noOptionSet.services.esTreeNodeToTSNodeMap).toStrictEqual(
        expect.any(WeakMap),
      );
      expect(noOptionSet.services.tsNodeToESTreeNodeMap).toStrictEqual(
        expect.any(WeakMap),
      );

      const withProjectNoOptionSet = parser.parseAndGenerateServices(
        code,
        projectConfig,
      );

      expect(
        withProjectNoOptionSet.services.esTreeNodeToTSNodeMap,
      ).toStrictEqual(expect.any(WeakMap));
      expect(
        withProjectNoOptionSet.services.tsNodeToESTreeNodeMap,
      ).toStrictEqual(expect.any(WeakMap));
    });

    function checkNodeMaps(setting: boolean): void {
      it('without project', () => {
        const parseResult = parser.parseAndGenerateServices(code, {
          ...baseConfig,
          preserveNodeMaps: setting,
        });

        expect(
          parseResult.services.esTreeNodeToTSNodeMap.has(
            parseResult.ast.body[0],
          ),
        ).toBe(setting);
      });

      it('with project', () => {
        const parseResult = parser.parseAndGenerateServices(code, {
          ...projectConfig,
          preserveNodeMaps: setting,
        });

        expect(
          parseResult.services.esTreeNodeToTSNodeMap.has(
            parseResult.ast.body[0],
          ),
        ).toBe(setting);
      });
    }

    describe('should preserve node maps for parseAndGenerateServices() when option is `true`, regardless of `project` config', () => {
      checkNodeMaps(true);
    });

    describe('should not preserve node maps for parseAndGenerateServices() when option is `false`, regardless of `project` config', () => {
      checkNodeMaps(false);
    });
  });

  describe('isolated parsing', () => {
    const config: TSESTreeOptions = {
      comment: true,
      disallowAutomaticSingleRunInference: true,
      loc: true,
      projectService: false,
      range: true,
      tokens: true,
    };
    const testParse = ({
      ext,
      jsxContent,
      jsxSetting,
      shouldThrow = false,
    }: {
      ext: '.js' | '.json' | '.jsx' | '.ts' | '.tsx' | '.vue';
      jsxContent: boolean;
      jsxSetting: boolean;
      shouldThrow?: boolean;
    }): void => {
      const code =
        ext === '.json'
          ? '{ "x": 1 }'
          : jsxContent
            ? 'const x = <div />;'
            : 'const x = 1';
      it(`should parse ${ext} file - ${
        jsxContent ? 'with' : 'without'
      } JSX content - parserOptions.jsx = ${jsxSetting}`, () => {
        let result:
          | parser.ParseAndGenerateServicesResult<typeof config>
          | undefined;
        // eslint-disable-next-line vitest/valid-expect
        const exp = expect(() => {
          result = parser.parseAndGenerateServices(code, {
            ...config,
            filePath: join(FIXTURES_DIR, `file${ext}`),
            jsx: jsxSetting,
          });
        });
        if (!shouldThrow) {
          exp.not.toThrow();
        } else {
          exp.toThrow();
        }

        if (!shouldThrow) {
          assert.isDefined(result?.ast);

          expect({
            ...result,
            services: {
              ...result.services,
              // Reduce noise in snapshot by not printing the TS program
              program:
                result.services.program == null ? 'No Program' : 'With Program',
            },
          }).toMatchSnapshot();
        }
      });
    };

    testParse({
      ext: '.js',
      jsxContent: false,
      jsxSetting: false,
    });
    testParse({
      ext: '.js',
      jsxContent: false,
      jsxSetting: true,
    });
    testParse({
      ext: '.js',
      jsxContent: true,
      jsxSetting: false,
    });
    testParse({
      ext: '.js',
      jsxContent: true,
      jsxSetting: true,
    });

    testParse({
      ext: '.jsx',
      jsxContent: false,
      jsxSetting: false,
    });
    testParse({
      ext: '.jsx',
      jsxContent: false,
      jsxSetting: true,
    });
    testParse({
      ext: '.jsx',
      jsxContent: true,
      jsxSetting: false,
    });
    testParse({
      ext: '.jsx',
      jsxContent: true,
      jsxSetting: true,
    });

    testParse({
      ext: '.ts',
      jsxContent: false,
      jsxSetting: false,
    });
    testParse({
      ext: '.ts',
      jsxContent: false,
      jsxSetting: true,
    });
    testParse({
      ext: '.ts',
      jsxContent: true,
      jsxSetting: false,
      shouldThrow: true, // Typescript does not allow JSX in a .ts file
    });
    testParse({
      ext: '.ts',
      jsxContent: true,
      jsxSetting: true,
      shouldThrow: true,
    });

    testParse({
      ext: '.tsx',
      jsxContent: false,
      jsxSetting: false,
    });
    testParse({
      ext: '.tsx',
      jsxContent: false,
      jsxSetting: true,
    });
    testParse({
      ext: '.tsx',
      jsxContent: true,
      jsxSetting: false,
    });
    testParse({
      ext: '.tsx',
      jsxContent: true,
      jsxSetting: true,
    });

    testParse({
      ext: '.vue',
      jsxContent: false,
      jsxSetting: false,
    });
    testParse({
      ext: '.vue',
      jsxContent: false,
      jsxSetting: true,
    });
    testParse({
      ext: '.vue',
      jsxContent: true,
      jsxSetting: false,
      shouldThrow: true, // "Unknown" filetype means we respect the JSX setting
    });
    testParse({
      ext: '.vue',
      jsxContent: true,
      jsxSetting: true,
    });
    testParse({
      ext: '.json',
      jsxContent: false,
      jsxSetting: false,
    });
  });

  describe('ESM parsing', () => {
    describe('TLA(Top Level Await)', () => {
      const config: TSESTreeOptions = {
        comment: true,
        loc: true,
        projectService: false,
        range: true,
        tokens: true,
      };
      const code = 'await(1)';

      const testParse = ({
        ext,
        shouldAllowTLA = false,
        sourceType,
      }: {
        ext: '.js' | '.mjs' | '.mts' | '.ts';
        shouldAllowTLA?: boolean;
        sourceType?: 'module' | 'script';
      }): void => {
        const ast = parser.parse(code, {
          ...config,
          filePath: `file${ext}`,
          sourceType,
        });
        const expressionType = (
          ast.body[0] as parser.TSESTree.ExpressionStatement
        ).expression.type;

        it(`parse(): should ${
          shouldAllowTLA ? 'allow' : 'not allow'
        } TLA for ${ext} file with sourceType = ${sourceType}`, () => {
          expect(expressionType).toBe(
            shouldAllowTLA
              ? parser.AST_NODE_TYPES.AwaitExpression
              : parser.AST_NODE_TYPES.CallExpression,
          );
        });
      };
      const testParseAndGenerateServices = ({
        ext,
        shouldAllowTLA = false,
        sourceType,
      }: {
        ext: '.js' | '.mjs' | '.mts' | '.ts';
        shouldAllowTLA?: boolean;
        sourceType?: 'module' | 'script';
      }): void => {
        const result = parser.parseAndGenerateServices(code, {
          ...config,
          filePath: `file${ext}`,
          sourceType,
        });
        const expressionType = (
          result.ast.body[0] as parser.TSESTree.ExpressionStatement
        ).expression.type;

        it(`parseAndGenerateServices(): should ${
          shouldAllowTLA ? 'allow' : 'not allow'
        } TLA for ${ext} file with sourceType = ${sourceType}`, () => {
          expect(expressionType).toBe(
            shouldAllowTLA
              ? parser.AST_NODE_TYPES.AwaitExpression
              : parser.AST_NODE_TYPES.CallExpression,
          );
        });
      };

      testParse({ ext: '.js' });
      testParse({ ext: '.ts' });
      testParse({ ext: '.mjs', shouldAllowTLA: true });
      testParse({ ext: '.mts', shouldAllowTLA: true });

      testParse({ ext: '.js', shouldAllowTLA: true, sourceType: 'module' });
      testParse({ ext: '.ts', shouldAllowTLA: true, sourceType: 'module' });
      testParse({ ext: '.mjs', shouldAllowTLA: true, sourceType: 'module' });
      testParse({ ext: '.mts', shouldAllowTLA: true, sourceType: 'module' });

      testParse({ ext: '.js', sourceType: 'script' });
      testParse({ ext: '.ts', sourceType: 'script' });
      testParse({ ext: '.mjs', sourceType: 'script' });
      testParse({ ext: '.mts', sourceType: 'script' });

      testParseAndGenerateServices({ ext: '.js' });
      testParseAndGenerateServices({ ext: '.ts' });
      testParseAndGenerateServices({ ext: '.mjs', shouldAllowTLA: true });
      testParseAndGenerateServices({ ext: '.mts', shouldAllowTLA: true });

      testParseAndGenerateServices({
        ext: '.js',
        shouldAllowTLA: true,
        sourceType: 'module',
      });
      testParseAndGenerateServices({
        ext: '.ts',
        shouldAllowTLA: true,
        sourceType: 'module',
      });
      testParseAndGenerateServices({
        ext: '.mjs',
        shouldAllowTLA: true,
        sourceType: 'module',
      });
      testParseAndGenerateServices({
        ext: '.mts',
        shouldAllowTLA: true,
        sourceType: 'module',
      });

      testParseAndGenerateServices({
        ext: '.js',
        sourceType: 'script',
      });
      testParseAndGenerateServices({
        ext: '.ts',
        sourceType: 'script',
      });
      testParseAndGenerateServices({
        ext: '.mjs',
        sourceType: 'script',
      });
      testParseAndGenerateServices({
        ext: '.mts',
        sourceType: 'script',
      });
    });
  });

  describe.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'invalid file error messages',
    () => {
      const PROJECT_DIR = resolve(FIXTURES_DIR, '..', 'invalidFileErrors');
      const code = 'var a = true';
      const config: TSESTreeOptions = {
        comment: true,
        disallowAutomaticSingleRunInference: true,
        loc: true,
        range: true,
        tokens: true,
        tsconfigRootDir: PROJECT_DIR,
      };
      const testParse =
        (filePath: string, extraFileExtensions: string[] = ['.vue']) =>
        (): void => {
          try {
            parser.parseAndGenerateServices(code, {
              ...config,
              extraFileExtensions,
              filePath: join(PROJECT_DIR, filePath),
              project: './tsconfig.json',
            });
          } catch (error) {
            alignErrorPath(error as Error);
          }
        };
      const testExtraFileExtensions =
        (filePath: string, extraFileExtensions: string[]) => (): void => {
          parser.parseAndGenerateServices(code, {
            ...config,
            extraFileExtensions,
            filePath: join(PROJECT_DIR, filePath),
            projectService: true,
          });
        };

      describe('project includes', () => {
        it("doesn't error for matched files", () => {
          expect(testParse('ts/included01.ts')).not.toThrow();
          expect(testParse('ts/included02.tsx')).not.toThrow();
          expect(testParse('js/included01.js')).not.toThrow();
          expect(testParse('js/included02.jsx')).not.toThrow();
        });

        it('errors for not included files', () => {
          expect(testParse('ts/notIncluded0j1.ts'))
            .toThrowErrorMatchingInlineSnapshot(`
              [Error: ESLint was configured to run on \`<tsconfigRootDir>/ts/notIncluded0j1.ts\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
              However, that TSConfig does not include this file. Either:
              - Change ESLint's list of included files to not include this file
              - Change that TSConfig to include this file
              - Create a new TSConfig that includes this file and include it in your parserOptions.project
              See the typescript-eslint docs for more info: https://typescript-eslint.io/troubleshooting/typed-linting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file]
            `);
          expect(testParse('ts/notIncluded02.tsx'))
            .toThrowErrorMatchingInlineSnapshot(`
              [Error: ESLint was configured to run on \`<tsconfigRootDir>/ts/notIncluded02.tsx\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
              However, that TSConfig does not include this file. Either:
              - Change ESLint's list of included files to not include this file
              - Change that TSConfig to include this file
              - Create a new TSConfig that includes this file and include it in your parserOptions.project
              See the typescript-eslint docs for more info: https://typescript-eslint.io/troubleshooting/typed-linting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file]
            `);
          expect(testParse('js/notIncluded01.js'))
            .toThrowErrorMatchingInlineSnapshot(`
              [Error: ESLint was configured to run on \`<tsconfigRootDir>/js/notIncluded01.js\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
              However, that TSConfig does not include this file. Either:
              - Change ESLint's list of included files to not include this file
              - Change that TSConfig to include this file
              - Create a new TSConfig that includes this file and include it in your parserOptions.project
              See the typescript-eslint docs for more info: https://typescript-eslint.io/troubleshooting/typed-linting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file]
            `);
          expect(testParse('js/notIncluded02.jsx'))
            .toThrowErrorMatchingInlineSnapshot(`
              [Error: ESLint was configured to run on \`<tsconfigRootDir>/js/notIncluded02.jsx\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
              However, that TSConfig does not include this file. Either:
              - Change ESLint's list of included files to not include this file
              - Change that TSConfig to include this file
              - Create a new TSConfig that includes this file and include it in your parserOptions.project
              See the typescript-eslint docs for more info: https://typescript-eslint.io/troubleshooting/typed-linting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file]
            `);
        });
      });

      describe('"parserOptions.extraFileExtensions" is empty', () => {
        it('should not error', () => {
          expect(testParse('ts/included01.ts', [])).not.toThrow();
        });

        it('the extension does not match', () => {
          expect(testParse('other/unknownFileType.unknown', []))
            .toThrowErrorMatchingInlineSnapshot(`
              [Error: ESLint was configured to run on \`<tsconfigRootDir>/other/unknownFileType.unknown\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
              The extension for the file (\`.unknown\`) is non-standard. You should add \`parserOptions.extraFileExtensions\` to your config.]
            `);
        });
      });

      describe('"parserOptions.extraFileExtensions" is non-empty', () => {
        describe('the extension matches', () => {
          it('the file is included', () => {
            expect(testParse('other/included.vue')).not.toThrow();
          });

          it("the file isn't included", () => {
            expect(testParse('other/notIncluded.vue'))
              .toThrowErrorMatchingInlineSnapshot(`
                [Error: ESLint was configured to run on \`<tsconfigRootDir>/other/notIncluded.vue\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
                However, that TSConfig does not include this file. Either:
                - Change ESLint's list of included files to not include this file
                - Change that TSConfig to include this file
                - Create a new TSConfig that includes this file and include it in your parserOptions.project
                See the typescript-eslint docs for more info: https://typescript-eslint.io/troubleshooting/typed-linting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file]
              `);
          });

          it('duplicate extension', () => {
            expect(testParse('ts/notIncluded.ts', ['.ts']))
              .toThrowErrorMatchingInlineSnapshot(`
                [Error: ESLint was configured to run on \`<tsconfigRootDir>/ts/notIncluded.ts\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
                You unnecessarily included the extension \`.ts\` with the \`parserOptions.extraFileExtensions\` option. This extension is already handled by the parser by default.
                However, that TSConfig does not include this file. Either:
                - Change ESLint's list of included files to not include this file
                - Change that TSConfig to include this file
                - Create a new TSConfig that includes this file and include it in your parserOptions.project
                See the typescript-eslint docs for more info: https://typescript-eslint.io/troubleshooting/typed-linting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file]
              `);
          });
        });

        it('invalid extension', () => {
          expect(testParse('other/unknownFileType.unknown', ['unknown']))
            .toThrowErrorMatchingInlineSnapshot(`
              [Error: ESLint was configured to run on \`<tsconfigRootDir>/other/unknownFileType.unknown\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
              Found unexpected extension \`unknown\` specified with the \`parserOptions.extraFileExtensions\` option. Did you mean \`.unknown\`?
              The extension for the file (\`.unknown\`) is non-standard. It should be added to your existing \`parserOptions.extraFileExtensions\`.]
            `);
        });

        it('the extension does not match', () => {
          expect(testParse('other/unknownFileType.unknown'))
            .toThrowErrorMatchingInlineSnapshot(`
              [Error: ESLint was configured to run on \`<tsconfigRootDir>/other/unknownFileType.unknown\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
              The extension for the file (\`.unknown\`) is non-standard. It should be added to your existing \`parserOptions.extraFileExtensions\`.]
            `);
        });
      });

      describe('"parserOptions.extraFileExtensions" is non-empty and projectService is true', () => {
        describe('the extension matches', () => {
          it('the file is included', () => {
            expect(
              testExtraFileExtensions('other/included.vue', ['.vue']),
            ).not.toThrow();
          });

          it("the file isn't included", () => {
            expect(
              testExtraFileExtensions('other/notIncluded.vue', ['.vue']),
            ).toThrow(/notIncluded\.vue was not found by the project service/);
          });

          it('duplicate extension', () => {
            expect(
              testExtraFileExtensions('ts/notIncluded.ts', ['.ts']),
            ).toThrow(/notIncluded\.ts was not found by the project service/);
          });
        });

        it('extension matching the file name but not a file on disk', () => {
          expect(
            testExtraFileExtensions('other/unknownFileType.unknown', [
              '.unknown',
            ]),
          ).toThrow(
            /unknownFileType\.unknown was not found by the project service/,
          );
        });

        it('the extension does not match the file name', () => {
          expect(
            testExtraFileExtensions('other/unknownFileType.unknown', ['.vue']),
          ).toThrow(
            /unknownFileType\.unknown was not found by the project service/,
          );
        });
      });
    },
  );

  describe('invalid project error messages', () => {
    it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
      'throws when none of multiple projects include the file',
      () => {
        const PROJECT_DIR = resolve(FIXTURES_DIR, '..', 'invalidFileErrors');
        const code = 'var a = true';
        const config: TSESTreeOptions = {
          comment: true,
          disallowAutomaticSingleRunInference: true,
          loc: true,
          project: ['./**/tsconfig.json', './**/tsconfig.extra.json'],
          range: true,
          tokens: true,
          tsconfigRootDir: PROJECT_DIR,
        };
        const testParse = (filePath: string) => (): void => {
          try {
            parser.parseAndGenerateServices(code, {
              ...config,
              filePath: join(PROJECT_DIR, filePath),
            });
          } catch (error) {
            alignErrorPath(error as Error);
          }
        };

        expect(testParse('ts/notIncluded0j1.ts'))
          .toThrowErrorMatchingInlineSnapshot(`
              [Error: ESLint was configured to run on \`<tsconfigRootDir>/ts/notIncluded0j1.ts\` using \`parserOptions.project\`:
              - <tsconfigRootDir>/tsconfig.json
              - <tsconfigRootDir>/tsconfig.extra.json
              However, none of those TSConfigs include this file. Either:
              - Change ESLint's list of included files to not include this file
              - Change one of those TSConfigs to include this file
              - Create a new TSConfig that includes this file and include it in your parserOptions.project
              See the typescript-eslint docs for more info: https://typescript-eslint.io/troubleshooting/typed-linting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file]
            `);
      },
    );
  });

  describe('debug options', () => {
    const debugEnable = vi.spyOn(debug, 'enable');
    vi.spyOn(debug, 'enabled').mockImplementation(() => false);

    it("shouldn't turn on debugger if no options were provided", () => {
      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: [],
        disallowAutomaticSingleRunInference: true,
      });
      expect(debugEnable).not.toHaveBeenCalled();
    });

    it('should turn on eslint debugger', () => {
      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: ['eslint'],
        disallowAutomaticSingleRunInference: true,
      });
      expect(debugEnable).toHaveBeenCalledExactlyOnceWith(
        'eslint:*,-eslint:code-path',
      );
    });

    it('should turn on typescript-eslint debugger', () => {
      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: ['typescript-eslint'],
        disallowAutomaticSingleRunInference: true,
      });
      expect(debugEnable).toHaveBeenCalledExactlyOnceWith(
        'typescript-eslint:*',
      );
    });

    it('should turn on both eslint and typescript-eslint debugger', () => {
      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: ['typescript-eslint', 'eslint'],
        disallowAutomaticSingleRunInference: true,
      });
      expect(debugEnable).toHaveBeenCalledExactlyOnceWith(
        'typescript-eslint:*,eslint:*,-eslint:code-path',
      );
    });

    it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
      'should turn on typescript debugger',
      () => {
        expect(() =>
          parser.parseAndGenerateServices('const x = 1;', {
            debugLevel: ['typescript'],
            disallowAutomaticSingleRunInference: true,
            filePath: './path-that-doesnt-exist.ts',
            project: ['./tsconfig-that-doesnt-exist.json'],
          }),
        ) // should throw because the file and tsconfig don't exist
          .toThrow();
        expect(createDefaultCompilerOptionsFromExtra).toHaveBeenCalledOnce();
        expect(createDefaultCompilerOptionsFromExtra).toHaveLastReturnedWith(
          expect.objectContaining({
            extendedDiagnostics: true,
          }),
        );
      },
    );
  });

  describe.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'projectFolderIgnoreList',
    () => {
      beforeEach(() => {
        parser.clearCaches();
      });

      const PROJECT_DIR = resolve(
        FIXTURES_DIR,
        '..',
        'projectFolderIgnoreList',
      );
      const code = 'var a = true';
      const config: TSESTreeOptions = {
        comment: true,
        disallowAutomaticSingleRunInference: true,
        loc: true,
        project: './**/tsconfig.json',
        range: true,
        tokens: true,
        tsconfigRootDir: PROJECT_DIR,
      };

      const testParse =
        (
          filePath: 'ignoreme' | 'includeme',
          projectFolderIgnoreList?: TSESTreeOptions['projectFolderIgnoreList'],
        ) =>
        (): void => {
          parser.parseAndGenerateServices(code, {
            ...config,
            filePath: join(PROJECT_DIR, filePath, './file.ts'),
            projectFolderIgnoreList,
          });
        };

      it('ignores nothing when given nothing', () => {
        expect(testParse('ignoreme')).not.toThrow();
        expect(testParse('includeme')).not.toThrow();
      });

      it('ignores a folder when given a string glob', () => {
        const ignore = ['**/ignoreme/**'];
        // cspell:disable-next-line
        expect(testParse('ignoreme', ignore)).toThrow();
        // cspell:disable-next-line
        expect(testParse('includeme', ignore)).not.toThrow();
      });
    },
  );

  describe.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'cacheLifetime',
    () => {
      describe('glob', () => {
        const project = ['./**/tsconfig.json', './**/tsconfig.extra.json'];
        // fast-glob returns arbitrary order of results to improve performance.
        // `resolveProjectList()` calls fast-glob for each pattern to ensure the
        // order is correct.
        // Thus the expected call time of spy is the number of patterns.
        const expectFastGlobCalls = project.length;
        function doParse(lifetime: CacheDurationSeconds): void {
          parser.parseAndGenerateServices('const x = 1', {
            cacheLifetime: {
              glob: lifetime,
            },
            disallowAutomaticSingleRunInference: true,
            filePath: join(FIXTURES_DIR, 'file.ts'),
            project,
            tsconfigRootDir: FIXTURES_DIR,
          });
        }

        it('should cache globs if the lifetime is non-zero', () => {
          doParse(30);
          expect(fastGlobSyncMock).toHaveBeenCalledTimes(expectFastGlobCalls);
          doParse(30);
          // shouldn't call fast-glob again due to the caching
          expect(fastGlobSyncMock).toHaveBeenCalledTimes(expectFastGlobCalls);
        });

        it('should not cache globs if the lifetime is zero', () => {
          doParse(0);
          expect(fastGlobSyncMock).toHaveBeenCalledTimes(expectFastGlobCalls);
          doParse(0);
          // should call fast-glob again because we specified immediate cache expiry
          expect(fastGlobSyncMock).toHaveBeenCalledTimes(
            expectFastGlobCalls * 2,
          );
        });

        it('should evict the cache if the entry expires', () => {
          hrtimeSpy.mockReturnValueOnce([1, 0]);

          doParse(30);
          expect(fastGlobSyncMock).toHaveBeenCalledTimes(expectFastGlobCalls);

          // wow so much time has passed
          hrtimeSpy.mockReturnValueOnce([Number.MAX_VALUE, 0]);

          doParse(30);
          // shouldn't call fast-glob again due to the caching
          expect(fastGlobSyncMock).toHaveBeenCalledTimes(
            expectFastGlobCalls * 2,
          );
        });

        it('should infinitely cache if passed Infinity', () => {
          hrtimeSpy.mockReturnValueOnce([1, 0]);

          doParse('Infinity');
          expect(fastGlobSyncMock).toHaveBeenCalledTimes(expectFastGlobCalls);

          // wow so much time has passed
          hrtimeSpy.mockReturnValueOnce([Number.MAX_VALUE, 0]);

          doParse('Infinity');
          // shouldn't call fast-glob again due to the caching
          expect(fastGlobSyncMock).toHaveBeenCalledTimes(expectFastGlobCalls);
        });
      });
    },
  );

  describe.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'project references',
    () => {
      beforeEach(() => {
        parser.clearCaches();
      });

      const PROJECT_DIR = resolve(FIXTURES_DIR, '..', 'projectReferences');
      const code = 'var a = true';

      const testParse = () => (): void => {
        parser.parseAndGenerateServices(code, {
          disallowAutomaticSingleRunInference: true,
          filePath: join(PROJECT_DIR, 'file.ts'),
          project: './**/tsconfig.json',
          tsconfigRootDir: PROJECT_DIR,
        });
      };

      it('throws a special-case error when project references are enabled in the only TSConfig and the file is not found', () => {
        expect(testParse()).toThrowErrorMatchingInlineSnapshot(`
          [Error: ESLint was configured to run on \`<tsconfigRootDir>/file.ts\` using \`parserOptions.project\`: <tsconfigRootDir>/tsconfig.json
          That TSConfig uses project "references" and doesn't include \`<tsconfigRootDir>/file.ts\` directly, which is not supported by \`parserOptions.project\`.
          Either:
          - Switch to \`parserOptions.projectService\`
          - Use an ESLint-specific TSConfig
          See the typescript-eslint docs for more info: https://typescript-eslint.io/troubleshooting/typed-linting#are-typescript-project-references-supported]
        `);
      });
    },
  );
});
