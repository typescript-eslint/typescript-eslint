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

  describe('line endings', () => {
    const config: ParserOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true
    };

    function validateLineEndings (code: string) {
      const result = parser.parse(`\`${code}\``, config) as any;
      expect(result.body[0].type).toBe(
        parser.AST_NODE_TYPES.ExpressionStatement
      );
      expect(result.body[0].expression.type).toBe(
        parser.AST_NODE_TYPES.TemplateLiteral
      );
      expect(result.body[0].expression.quasis[0].type).toBe(
        parser.AST_NODE_TYPES.TemplateElement
      );
      const value = result.body[0].expression.quasis[0].value;
      expect(value.raw).toBe(code);
      expect(value.cooked).toBe(code);
    }

    it('should parse unix EOL correctly', () => {
      validateLineEndings(`\n\n\n\n`);
    });

    it('should parse windows EOL correctly', () => {
      validateLineEndings(`\r\n\r\n\r\n`);
    });

    it('should parse mac EOL correctly', () => {
      validateLineEndings(`\r\r\r`);
    });
  });
});
