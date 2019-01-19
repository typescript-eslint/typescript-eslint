/**
 * @fileoverview Tests for JSX
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import { readFileSync } from 'fs';
import glob from 'glob';
import { ParserOptions } from '../../src/temp-types-based-on-js-source';
import {
  createSnapshotTestBlock,
  formatSnapshotName
} from '../../tools/test-utils';
import filesWithKnownIssues from '../../../shared-fixtures/jsx-known-issues';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const JSX_FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/jsx';
const jsxTestFiles = glob
  .sync(`${JSX_FIXTURES_DIR}/**/*.src.js`)
  .filter(filename =>
    filesWithKnownIssues.every(fileName => !filename.includes(fileName))
  );

const JSX_JSXTEXT_FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/jsx-useJSXTextNode';
const jsxTextTestFiles = glob.sync(`${JSX_JSXTEXT_FIXTURES_DIR}/**/*.src.js`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('JSX', () => {
  /**
   * Test each fixture file
   */
  function testFixture(
    fixturesDir: string,
    useJSXTextNode: boolean
  ): (filename: string) => void {
    return filename => {
      const code = readFileSync(filename, 'utf8');
      const config: ParserOptions = {
        loc: true,
        range: true,
        tokens: true,
        errorOnUnknownASTType: true,
        useJSXTextNode,
        jsx: true
      };
      it(
        formatSnapshotName(filename, fixturesDir),
        createSnapshotTestBlock(code, config)
      );
    };
  }

  describe('useJSXTextNode: false', () => {
    jsxTestFiles.forEach(testFixture(JSX_FIXTURES_DIR, false));
  });
  describe('useJSXTextNode: true', () => {
    jsxTextTestFiles.forEach(testFixture(JSX_JSXTEXT_FIXTURES_DIR, true));
  });
});
