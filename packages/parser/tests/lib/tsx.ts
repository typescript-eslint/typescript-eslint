import { parseForESLint } from '../../src/parser';
import { serializer } from '../tools/ts-error-serializer';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

expect.addSnapshotSerializer(serializer);

describe('TSX', () => {
  describe("if the filename ends with '.tsx', enable jsx option automatically.", () => {
    it('filePath was not provided', () => {
      const code = 'const element = <T/>';
      try {
        parseForESLint(code);
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
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
      try {
        parseForESLint(code, {
          filePath: 'test.ts',
        });
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });

    it("test.ts with 'jsx:true' option", () => {
      const code = 'const element = <T/>';

      try {
        parseForESLint(code, {
          filePath: 'test.ts',
          ecmaFeatures: {
            jsx: true,
          },
        });
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
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
