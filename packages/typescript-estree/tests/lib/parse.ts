/**
 * @fileoverview Tests for tokenize().
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import * as parser from '../../src/parser';
import * as astConverter from '../../src/ast-converter';
import { ParserOptions } from '../../src/temp-types-based-on-js-source';
import { createSnapshotTestBlock } from '../../tools/test-utils';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

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
      'should correctly convert code to string',
      createSnapshotTestBlock(code, config)
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
        jasmine.any(Object),
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
          tokens: jasmine.any(Array),
          tsconfigRootDir: jasmine.any(String),
          useJSXTextNode: false
        },
        false
      );
    });
  });
});
