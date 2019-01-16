import { Linter } from 'eslint';
import fs from 'fs';
import glob from 'glob';
import * as parser from '../../src/parser';
import testUtils from '../../tools/test-utils';

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/tsx';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.tsx`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('TSX', () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    const config = {
      useJSXTextNode: true,
      jsx: true
    };
    it(
      testUtils.formatSnapshotName(filename, FIXTURES_DIR, '.tsx'),
      testUtils.createSnapshotTestBlock(code, config)
    );
  });

  describe("if the filename ends with '.tsx', enable jsx option automatically.", () => {
    const linter = new Linter();
    linter.defineParser('typescript-eslint-parser', parser);

    it('filePath was not provided', () => {
      const code = 'const element = <T/>';
      const config = {
        parser: 'typescript-eslint-parser'
      };
      const messages = linter.verify(code, config);

      expect(messages).toStrictEqual([
        {
          column: 18,
          fatal: true,
          line: 1,
          message: "Parsing error: '>' expected.",
          ruleId: null,
          severity: 2,
          source: 'const element = <T/>'
        }
      ]);
    });

    it("filePath was not provided and 'jsx:true' option", () => {
      const code = 'const element = <T/>';
      const config = {
        parser: 'typescript-eslint-parser',
        parserOptions: {
          jsx: true
        }
      };
      const messages = linter.verify(code, config);

      expect(messages).toStrictEqual([]);
    });

    it('test.ts', () => {
      const code = 'const element = <T/>';
      const config = {
        parser: 'typescript-eslint-parser'
      };
      const messages = linter.verify(code, config, { filename: 'test.ts' });

      expect(messages).toStrictEqual([
        {
          column: 18,
          fatal: true,
          line: 1,
          message: "Parsing error: '>' expected.",
          ruleId: null,
          severity: 2,
          source: 'const element = <T/>'
        }
      ]);
    });

    it("test.ts with 'jsx:true' option", () => {
      const code = 'const element = <T/>';
      const config = {
        parser: 'typescript-eslint-parser',
        parserOptions: {
          jsx: true
        }
      };
      const messages = linter.verify(code, config, { filename: 'test.ts' });

      expect(messages).toStrictEqual([
        {
          column: 18,
          fatal: true,
          line: 1,
          message: "Parsing error: '>' expected.",
          ruleId: null,
          severity: 2,
          source: 'const element = <T/>'
        }
      ]);
    });

    it('test.tsx', () => {
      const code = 'const element = <T/>';
      const config = {
        parser: 'typescript-eslint-parser'
      };
      const messages = linter.verify(code, config, { filename: 'test.tsx' });

      expect(messages).toStrictEqual([]);
    });

    it("test.tsx with 'jsx:false' option", () => {
      const code = 'const element = <T/>';
      const config = {
        parser: 'typescript-eslint-parser',
        parserOptions: {
          jsx: false
        }
      };
      const messages = linter.verify(code, config, { filename: 'test.tsx' });

      expect(messages).toStrictEqual([]);
    });
  });
});
