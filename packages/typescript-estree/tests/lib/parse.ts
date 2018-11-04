/**
 * @fileoverview Tests for tokenize().
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import * as parser from '../../src/parser';
import { ParserOptions } from '../../src/temp-types-based-on-js-source';
import { createSnapshotTestBlock } from '../../tools/test-utils';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('parse()', () => {
  describe('basic functionality', () => {
    it('should parse an empty string', () => {
      expect((parser as any).parse('').body).toEqual([]);
      expect(parser.parse('', {} as any).body).toEqual([]);
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
    const config = {
      comment: true,
      tokens: true,
      range: true,
      loc: true
    };

    it(
      'output tokens, comments, locs, and ranges when called with those options',
      createSnapshotTestBlock(code, config as ParserOptions)
    );
  });
});
