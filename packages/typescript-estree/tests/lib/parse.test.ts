import debug from 'debug';
import { join, resolve } from 'path';
import * as parser from '../../src';
import * as astConverter from '../../src/ast-converter';
import { TSESTreeOptions } from '../../src/parser-options';
import * as sharedParserUtils from '../../src/create-program/shared';
import { createSnapshotTestBlock } from '../../tools/test-utils';

const FIXTURES_DIR = join(__dirname, '../fixtures/simpleProject');

describe('parseWithNodeMaps()', () => {
  describe('basic functionality', () => {
    it('should parse an empty string', () => {
      expect(parser.parseWithNodeMaps('').ast.body).toEqual([]);
      expect(parser.parseWithNodeMaps('', {}).ast.body).toEqual([]);
    });

    it('parse() should be the same as parseWithNodeMaps().ast', () => {
      const code = 'const x: number = 1;';
      expect(parser.parseWithNodeMaps(code).ast).toMatchObject(
        parser.parse(code),
      );
    });
  });

  describe('modules', () => {
    it('should have correct column number when strict mode error occurs', () => {
      try {
        parser.parseWithNodeMaps('function fn(a, a) {\n}');
      } catch (err) {
        expect(err.column).toEqual(16);
      }
    });
  });

  describe('general', () => {
    const code = 'let foo = bar;';
    const config: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
    };

    it(
      'output tokens, comments, locs, and ranges when called with those options',
      createSnapshotTestBlock(code, config),
    );

    it(
      'output should not contain loc',
      createSnapshotTestBlock(code, {
        range: true,
        loc: false,
      }),
    );

    it(
      'output should not contain range',
      createSnapshotTestBlock(code, {
        range: false,
        loc: true,
      }),
    );
  });

  describe('non string code', () => {
    // testing a non string code..
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (12345 as any) as string;
    const config: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
    };

    it(
      'should correctly convert code to a string for parse()',
      createSnapshotTestBlock(code, config),
    );

    it(
      'should correctly convert code to a string for parseAndGenerateServices()',
      createSnapshotTestBlock(code, config, true),
    );
  });

  describe('loggerFn should be propagated to ast-converter', () => {
    it('output tokens, comments, locs, and ranges when called with those options', () => {
      const spy = jest.spyOn(astConverter, 'astConverter');

      const loggerFn = jest.fn(() => {});

      parser.parseWithNodeMaps('let foo = bar;', {
        loggerFn,
        comment: true,
        tokens: true,
        range: true,
        loc: true,
      });

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][1]).toMatchObject({
        code: 'let foo = bar;',
        comment: true,
        comments: [],
        loc: true,
        log: loggerFn,
        range: true,
        tokens: expect.any(Array),
      });
    });
  });
});

describe('parseAndGenerateServices', () => {
  describe('errorOnTypeScriptSyntacticAndSemanticIssues', () => {
    const code = '@test const foo = 2';
    const options: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: true,
    };

    it('should throw on invalid option when used in parseWithNodeMaps', () => {
      expect(() => {
        parser.parseWithNodeMaps(code, options);
      }).toThrow(
        `"errorOnTypeScriptSyntacticAndSemanticIssues" is only supported for parseAndGenerateServices()`,
      );
    });

    it('should not throw when used in parseAndGenerateServices', () => {
      expect(() => {
        parser.parseAndGenerateServices(code, options);
      }).not.toThrow(
        `"errorOnTypeScriptSyntacticAndSemanticIssues" is only supported for parseAndGenerateServices()`,
      );
    });

    it('should error on invalid code', () => {
      expect(() => {
        parser.parseAndGenerateServices(code, options);
      }).toThrow('Decorators are not valid here.');
    });
  });

  describe('preserveNodeMaps', () => {
    const code = 'var a = true';
    const baseConfig: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      filePath: 'file.ts',
    };
    const projectConfig: TSESTreeOptions = {
      ...baseConfig,
      tsconfigRootDir: FIXTURES_DIR,
      project: './tsconfig.json',
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

    it('should not impact the use of parseWithNodeMaps()', () => {
      const resultWithNoOptionSet = parser.parseWithNodeMaps(code, baseConfig);
      const resultWithOptionSetToTrue = parser.parseWithNodeMaps(code, {
        ...baseConfig,
        preserveNodeMaps: true,
      });
      const resultWithOptionSetToFalse = parser.parseWithNodeMaps(code, {
        ...baseConfig,
        preserveNodeMaps: false,
      });
      const resultWithOptionSetExplicitlyToUndefined = parser.parseWithNodeMaps(
        code,
        {
          ...baseConfig,
          preserveNodeMaps: undefined,
        },
      );

      expect(resultWithNoOptionSet).toMatchObject(resultWithOptionSetToTrue);
      expect(resultWithNoOptionSet).toMatchObject(resultWithOptionSetToFalse);
      expect(resultWithNoOptionSet).toMatchObject(
        resultWithOptionSetExplicitlyToUndefined,
      );
    });

    it('should preserve node maps by default for parseAndGenerateServices()', () => {
      const noOptionSet = parser.parseAndGenerateServices(code, baseConfig);

      expect(noOptionSet.services.esTreeNodeToTSNodeMap).toEqual(
        expect.any(WeakMap),
      );
      expect(noOptionSet.services.tsNodeToESTreeNodeMap).toEqual(
        expect.any(WeakMap),
      );

      const withProjectNoOptionSet = parser.parseAndGenerateServices(
        code,
        projectConfig,
      );

      expect(withProjectNoOptionSet.services.esTreeNodeToTSNodeMap).toEqual(
        expect.any(WeakMap),
      );
      expect(withProjectNoOptionSet.services.tsNodeToESTreeNodeMap).toEqual(
        expect.any(WeakMap),
      );
    });

    function checkNodeMaps(setting: boolean): void {
      it('without project', () => {
        const parseResult = parser.parseAndGenerateServices(code, {
          ...baseConfig,
          preserveNodeMaps: setting,
        });

        expect(parseResult.services.esTreeNodeToTSNodeMap).toBeDefined();
        expect(parseResult.services.tsNodeToESTreeNodeMap).toBeDefined();
        expect(
          parseResult.services.esTreeNodeToTSNodeMap.has(
            parseResult.ast.body[0],
          ),
        ).toBe(setting);
        expect(
          parseResult.services.tsNodeToESTreeNodeMap.has(
            parseResult.services.program.getSourceFile('estree.ts'),
          ),
        ).toBe(setting);
      });

      it('with project', () => {
        const parseResult = parser.parseAndGenerateServices(code, {
          ...projectConfig,
          preserveNodeMaps: setting,
        });

        expect(parseResult.services.esTreeNodeToTSNodeMap).toBeDefined();
        expect(parseResult.services.tsNodeToESTreeNodeMap).toBeDefined();
        expect(
          parseResult.services.esTreeNodeToTSNodeMap.has(
            parseResult.ast.body[0],
          ),
        ).toBe(setting);
        expect(
          parseResult.services.tsNodeToESTreeNodeMap.has(
            parseResult.services.program.getSourceFile(
              join(FIXTURES_DIR, 'file.ts'),
            ),
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
      tokens: true,
      range: true,
      loc: true,
    };
    const testParse = ({
      ext,
      jsxContent,
      jsxSetting,
      shouldThrow = false,
    }: {
      ext: '.js' | '.jsx' | '.ts' | '.tsx' | '.vue' | '.json';
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
        const exp = expect(() => {
          result = parser.parseAndGenerateServices(code, {
            ...config,
            jsx: jsxSetting,
            filePath: join(FIXTURES_DIR, `file${ext}`),
          });
        });
        if (!shouldThrow) {
          exp.not.toThrow();
        } else {
          exp.toThrow();
        }

        if (!shouldThrow) {
          expect(result?.services.program).toBeDefined();
          expect(result?.ast).toBeDefined();
          expect({
            ...result,
            services: {
              ...result?.services,
              // Reduce noise in snapshot
              program: {},
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

  describe('invalid file error messages', () => {
    const PROJECT_DIR = resolve(FIXTURES_DIR, '../invalidFileErrors');
    const code = 'var a = true';
    const config: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      tsconfigRootDir: PROJECT_DIR,
      project: './tsconfig.json',
    };
    const testParse = (
      filePath: string,
      extraFileExtensions: string[] = ['.vue'],
    ) => (): void => {
      try {
        parser.parseAndGenerateServices(code, {
          ...config,
          extraFileExtensions,
          filePath: join(PROJECT_DIR, filePath),
        });
      } catch (error) {
        /**
         * Aligns paths between environments, node for windows uses `\`, for linux and mac uses `/`
         */
        error.message = error.message.replace(/\\(?!["])/gm, '/');
        throw error;
      }
    };

    describe('project includes', () => {
      it("doesn't error for matched files", () => {
        expect(testParse('ts/included.ts')).not.toThrow();
        expect(testParse('ts/included.tsx')).not.toThrow();
        expect(testParse('js/included.js')).not.toThrow();
        expect(testParse('js/included.jsx')).not.toThrow();
      });

      it('errors for not included files', () => {
        expect(testParse('ts/notIncluded.ts')).toThrowErrorMatchingSnapshot();
        expect(testParse('ts/notIncluded.tsx')).toThrowErrorMatchingSnapshot();
        expect(testParse('js/notIncluded.js')).toThrowErrorMatchingSnapshot();
        expect(testParse('js/notIncluded.jsx')).toThrowErrorMatchingSnapshot();
      });
    });

    describe('"parserOptions.extraFileExtensions" is empty', () => {
      it('should not error', () => {
        expect(testParse('ts/included.ts', [])).not.toThrow();
      });

      it('the extension does not match', () => {
        expect(
          testParse('other/unknownFileType.unknown', []),
        ).toThrowErrorMatchingSnapshot();
      });
    });

    describe('"parserOptions.extraFileExtensions" is non-empty', () => {
      describe('the extension matches', () => {
        it('the file is included', () => {
          expect(testParse('other/included.vue')).not.toThrow();
        });

        it("the file isn't included", () => {
          expect(
            testParse('other/notIncluded.vue'),
          ).toThrowErrorMatchingSnapshot();
        });

        it('duplicate extension', () => {
          expect(
            testParse('ts/notIncluded.ts', ['.ts']),
          ).toThrowErrorMatchingSnapshot();
        });
      });

      it('invalid extension', () => {
        expect(
          testParse('other/unknownFileType.unknown', ['unknown']),
        ).toThrowErrorMatchingSnapshot();
      });

      it('the extension does not match', () => {
        expect(
          testParse('other/unknownFileType.unknown'),
        ).toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe('debug options', () => {
    const debugEnable = jest.fn();
    beforeEach(() => {
      debugEnable.mockReset();
      debug.enable = debugEnable;
      jest.spyOn(debug, 'enabled').mockImplementation(() => false);
    });

    it("shouldn't turn on debugger if no options were provided", () => {
      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: [],
      });
      expect(debugEnable).not.toHaveBeenCalled();
    });

    it('should turn on eslint debugger', () => {
      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: ['eslint'],
      });
      expect(debugEnable).toHaveBeenCalledTimes(1);
      expect(debugEnable).toHaveBeenCalledWith('eslint:*,-eslint:code-path');
    });

    it('should turn on typescript-eslint debugger', () => {
      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: ['typescript-eslint'],
      });
      expect(debugEnable).toHaveBeenCalledTimes(1);
      expect(debugEnable).toHaveBeenCalledWith('typescript-eslint:*');
    });

    it('should turn on both eslint and typescript-eslint debugger', () => {
      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: ['typescript-eslint', 'eslint'],
      });
      expect(debugEnable).toHaveBeenCalledTimes(1);
      expect(debugEnable).toHaveBeenCalledWith(
        'typescript-eslint:*,eslint:*,-eslint:code-path',
      );
    });

    it('should turn on typescript debugger', () => {
      const spy = jest.spyOn(
        sharedParserUtils,
        'createDefaultCompilerOptionsFromExtra',
      );

      parser.parseAndGenerateServices('const x = 1;', {
        debugLevel: ['typescript'],
      });
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveReturnedWith(
        expect.objectContaining({
          extendedDiagnostics: true,
        }),
      );
    });
  });

  describe('projectFolderIgnoreList', () => {
    beforeEach(() => {
      parser.clearCaches();
    });

    const PROJECT_DIR = resolve(FIXTURES_DIR, '../projectFolderIgnoreList');
    const code = 'var a = true';
    const config: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      tsconfigRootDir: PROJECT_DIR,
      project: './**/tsconfig.json',
    };

    const testParse = (
      filePath: 'ignoreme' | 'includeme',
      projectFolderIgnoreList?: TSESTreeOptions['projectFolderIgnoreList'],
    ) => (): void => {
      parser.parseAndGenerateServices(code, {
        ...config,
        projectFolderIgnoreList,
        filePath: join(PROJECT_DIR, filePath, './file.ts'),
      });
    };

    it('ignores nothing when given nothing', () => {
      expect(testParse('ignoreme')).not.toThrow();
      expect(testParse('includeme')).not.toThrow();
    });

    it('ignores a folder when given a string glob', () => {
      const ignore = ['**/ignoreme/**'];
      expect(testParse('ignoreme', ignore)).toThrow();
      expect(testParse('includeme', ignore)).not.toThrow();
    });
  });
});
