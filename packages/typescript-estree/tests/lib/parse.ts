import * as parser from '../../src/parser';
import * as astConverter from '../../src/ast-converter';
import { ParserOptions } from '../../src/parser-options';
import { createSnapshotTestBlock } from '../../tools/test-utils';

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
        parser.parse('function fn(a, a) {\n}', { sourceType: 'module' } as any);
      } catch (err) {
        expect(err.column).toEqual(16);
      }
    });
  });

  describe('general', () => {
    const code = 'let foo = bar;';
    const config: ParserOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true
    };

    it(
      'output tokens, comments, locs, and ranges when called with those options',
      createSnapshotTestBlock(code, config)
    );
  });

  describe('non string code', () => {
    const code = (12345 as any) as string;
    const config: ParserOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true
    };

    it(
      'should correctly convert code to a string for parse()',
      createSnapshotTestBlock(code, config)
    );

    it(
      'should correctly convert code to a string for parseAndGenerateServices()',
      createSnapshotTestBlock(code, config, true)
    );
  });

  describe('loggerFn should be propagated to ast-converter', () => {
    it('output tokens, comments, locs, and ranges when called with those options', () => {
      const spy = jest.spyOn(astConverter, 'default');

      const loggerFn = jest.fn(() => true);

      parser.parse('let foo = bar;', {
        loggerFn,
        comment: true,
        tokens: true,
        range: true,
        loc: true
      });

      expect(spy).toHaveBeenCalledWith(
        expect.any(Object),
        {
          code: 'let foo = bar;',
          comment: true,
          comments: [],
          errorOnTypeScriptSyntacticAndSemanticIssues: false,
          errorOnUnknownASTType: false,
          extraFileExtensions: [],
          jsx: false,
          loc: true,
          log: loggerFn,
          projects: [],
          range: true,
          strict: false,
          tokens: expect.any(Array),
          tsconfigRootDir: expect.any(String),
          useJSXTextNode: false
        },
        false
      );
    });
  });

  describe('errorOnTypeScriptSyntacticAndSemanticIssues', () => {
    const code = '@test const foo = 2';
    const options: ParserOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: true
    };

    it('should throw on invalid option when used in parse', () => {
      expect(() => {
        parser.parse(code, options);
      }).toThrow(
        `"errorOnTypeScriptSyntacticAndSemanticIssues" is only supported for parseAndGenerateServices()`
      );
    });

    it('should not throw when used in parseAndGenerateServices', () => {
      expect(() => {
        parser.parseAndGenerateServices(code, options);
      }).not.toThrow(
        `"errorOnTypeScriptSyntacticAndSemanticIssues" is only supported for parseAndGenerateServices()`
      );
    });

    it('should error on invalid code', () => {
      expect(() => {
        parser.parseAndGenerateServices(code, options);
      }).toThrow('Decorators are not valid here.');
    });
  });
});
