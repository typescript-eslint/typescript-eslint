import { parseForESLint } from '../../src/index.js';
import { serializer } from '../test-utils/ts-error-serializer.js';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

expect.addSnapshotSerializer(serializer);

describe('TSX', () => {
  describe("if the filename ends with '.tsx', enable jsx option automatically.", () => {
    it('filePath was not provided', () => {
      const code = 'const element = <T/>';

      expect(() => {
        parseForESLint(code);
      }).toThrowErrorMatchingInlineSnapshot(`
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
      expect(() => {
        parseForESLint(code, {
          ecmaFeatures: {
            jsx: true,
          },
        });
      }).not.toThrow();
    });

    it('test.ts', () => {
      const code = 'const element = <T/>';
      expect(() => {
        parseForESLint(code, {
          filePath: 'test.ts',
        });
      }).toThrowErrorMatchingInlineSnapshot(`
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

      expect(() => {
        parseForESLint(code, {
          ecmaFeatures: {
            jsx: true,
          },
          filePath: 'test.ts',
        });
      }).toThrowErrorMatchingInlineSnapshot(`
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
      expect(() => {
        parseForESLint(code, {
          filePath: 'test.tsx',
        });
      }).not.toThrow();
    });

    it("test.tsx with 'jsx:false' option", () => {
      const code = 'const element = <T/>';
      expect(() => {
        parseForESLint(code, {
          ecmaFeatures: {
            jsx: false,
          },
          filePath: 'test.tsx',
        });
      }).not.toThrow();
    });
  });
});
