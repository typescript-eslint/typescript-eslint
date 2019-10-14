import { join, resolve, relative } from 'path';
import * as parser from '../../src/parser';
import * as astConverter from '../../src/ast-converter';
import { TSESTreeOptions } from '../../src/parser-options';
import { createSnapshotTestBlock } from '../../tools/test-utils';

const FIXTURES_DIR = './tests/fixtures/simpleProject';

describe('parse()', () => {
  describe('basic functionality', () => {
    it('should parse an empty string', () => {
      expect(parser.parse('').body).toEqual([]);
      expect(parser.parse('', {}).body).toEqual([]);
    });
  });

  describe('modules', () => {
    it('should have correct column number when strict mode error occurs', () => {
      try {
        parser.parse('function fn(a, a) {\n}');
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

      const loggerFn = jest.fn(() => true);

      parser.parse('let foo = bar;', {
        loggerFn,
        comment: true,
        tokens: true,
        range: true,
        loc: true,
      });

      expect(spy).toHaveBeenCalledWith(
        expect.any(Object),
        {
          code: 'let foo = bar;',
          comment: true,
          comments: [],
          createDefaultProgram: false,
          errorOnTypeScriptSyntacticAndSemanticIssues: false,
          errorOnUnknownASTType: false,
          extraFileExtensions: [],
          jsx: false,
          loc: true,
          log: loggerFn,
          noWatch: false,
          preserveNodeMaps: false,
          projects: [],
          range: true,
          strict: false,
          tokens: expect.any(Array),
          tsconfigRootDir: expect.any(String),
          useJSXTextNode: false,
        },
        false,
      );
    });
  });

  describe('errorOnTypeScriptSyntacticAndSemanticIssues', () => {
    const code = '@test const foo = 2';
    const options: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: true,
    };

    it('should throw on invalid option when used in parse', () => {
      expect(() => {
        parser.parse(code, options);
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
      filePath: 'tests/fixtures/simpleProject/file.ts',
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

    it('should not preserve node maps by default for parseAndGenerateServices(), unless `project` is set', () => {
      const noOptionSet = parser.parseAndGenerateServices(code, baseConfig);

      expect(noOptionSet.services.esTreeNodeToTSNodeMap).toBeUndefined();
      expect(noOptionSet.services.tsNodeToESTreeNodeMap).toBeUndefined();

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

    it('should preserve node maps for parseAndGenerateServices() when option is `true`, regardless of `project` config', () => {
      const optionSetToTrue = parser.parseAndGenerateServices(code, {
        ...baseConfig,
        preserveNodeMaps: true,
      });

      expect(optionSetToTrue.services.esTreeNodeToTSNodeMap).toEqual(
        expect.any(WeakMap),
      );
      expect(optionSetToTrue.services.tsNodeToESTreeNodeMap).toEqual(
        expect.any(WeakMap),
      );

      const withProjectOptionSetToTrue = parser.parseAndGenerateServices(code, {
        ...projectConfig,
        preserveNodeMaps: true,
      });

      expect(withProjectOptionSetToTrue.services.esTreeNodeToTSNodeMap).toEqual(
        expect.any(WeakMap),
      );
      expect(withProjectOptionSetToTrue.services.tsNodeToESTreeNodeMap).toEqual(
        expect.any(WeakMap),
      );
    });

    it('should not preserve node maps for parseAndGenerateServices() when option is `false`, regardless of `project` config', () => {
      const optionSetToFalse = parser.parseAndGenerateServices(code, {
        ...baseConfig,
        preserveNodeMaps: false,
      });

      expect(optionSetToFalse.services.esTreeNodeToTSNodeMap).toBeUndefined();
      expect(optionSetToFalse.services.tsNodeToESTreeNodeMap).toBeUndefined();

      const withProjectOptionSetToFalse = parser.parseAndGenerateServices(
        code,
        {
          ...projectConfig,
          preserveNodeMaps: false,
        },
      );

      expect(
        withProjectOptionSetToFalse.services.esTreeNodeToTSNodeMap,
      ).toBeUndefined();
      expect(
        withProjectOptionSetToFalse.services.tsNodeToESTreeNodeMap,
      ).toBeUndefined();
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
      extraFileExtensions: ['.vue'],
    };
    const testParse = (filePath: string) => (): void => {
      parser.parseAndGenerateServices(code, {
        ...config,
        filePath: relative(process.cwd(), join(PROJECT_DIR, filePath)),
      });
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
      });

      it('the extension does not match', () => {
        expect(
          testParse('other/unknownFileType.unknown'),
        ).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
