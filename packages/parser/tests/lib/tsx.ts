import type { ParserOptions } from '@typescript-eslint/types';

import { parseForESLint } from '../../src/parser';
import { serializer } from '../tools/ts-error-serializer';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

expect.addSnapshotSerializer(serializer);

function parseWithError(code: string, options?: ParserOptions | null): unknown {
  try {
    return parseForESLint(code, options);
  } catch (e) {
    return e;
  }
}

describe('TSX', () => {
  describe("if the filename ends with '.tsx', enable jsx option automatically.", () => {
    it('filePath was not provided', () => {
      const code = 'const element = <T/>';

      expect(parseWithError(code)).toMatchInlineSnapshot(`
        TSError {
          "column": 18,
          "index": 18,
          "lineNumber": 1,
          "message": "'>' expected.",
        }
      `);
    });

    it("filePath was not provided and 'jsx:true' option", () => {
      const code = 'const element = <T/>';
      expect(() =>
        parseForESLint(code, {
          ecmaFeatures: {
            jsx: true,
          },
        }),
      ).not.toThrow();
    });

    it('test.ts', () => {
      const code = 'const element = <T/>';
      expect(
        parseWithError(code, {
          filePath: 'test.ts',
        }),
      ).toMatchInlineSnapshot(`
        TSError {
          "column": 18,
          "index": 18,
          "lineNumber": 1,
          "message": "'>' expected.",
        }
      `);
    });

    it("test.ts with 'jsx:true' option", () => {
      const code = 'const element = <T/>';

      expect(
        parseWithError(code, {
          filePath: 'test.ts',
          ecmaFeatures: {
            jsx: true,
          },
        }),
      ).toMatchInlineSnapshot(`
        TSError {
          "column": 18,
          "index": 18,
          "lineNumber": 1,
          "message": "'>' expected.",
        }
      `);
    });

    it('test.tsx', () => {
      const code = 'const element = <T/>';
      expect(() =>
        parseForESLint(code, {
          filePath: 'test.tsx',
        }),
      ).not.toThrow();
    });

    it("test.tsx with 'jsx:false' option", () => {
      const code = 'const element = <T/>';
      expect(() =>
        parseForESLint(code, {
          ecmaFeatures: {
            jsx: false,
          },
          filePath: 'test.tsx',
        }),
      ).not.toThrow();
    });
  });
});
