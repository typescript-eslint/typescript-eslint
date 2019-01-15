/**
 * @fileoverview Tests for JSX
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import path from 'path';
import shelljs from 'shelljs';
import { ParserOptions } from '../../src/temp-types-based-on-js-source';
import { createSnapshotTestBlock } from '../../tools/test-utils';
import filesWithKnownIssues from '../jsx-known-issues';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const JSX_FIXTURES_DIR =
  'node_modules/@typescript-eslint/shared-fixtures/fixtures/jsx';

const jsxTestFiles = shelljs
  .find(JSX_FIXTURES_DIR)
  .filter(filename => filename.indexOf('.src.js') > -1)
  .filter(filename =>
    filesWithKnownIssues.every(fileName => filename.indexOf(fileName) === -1)
  )
  // strip off ".src.js"
  .map(filename =>
    filename.substring(JSX_FIXTURES_DIR.length + 1, filename.length - 7)
  );

const JSX_JSXTEXT_FIXTURES_DIR =
  'node_modules/@typescript-eslint/shared-fixtures/fixtures/jsx-useJSXTextNode';

const jsxTextTestFiles = shelljs
  .find(JSX_JSXTEXT_FIXTURES_DIR)
  .filter(filename => filename.indexOf('.src.js') > -1)
  // strip off ".src.js"
  .map(filename =>
    filename.substring(JSX_JSXTEXT_FIXTURES_DIR.length + 1, filename.length - 7)
  );

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
      const code = shelljs.cat(`${path.resolve(fixturesDir, filename)}.src.js`);

      const config = {
        loc: true,
        range: true,
        tokens: true,
        errorOnUnknownASTType: true,
        useJSXTextNode,
        jsx: true
      };

      it(
        `fixtures/${filename}.src`,
        createSnapshotTestBlock(code, config as ParserOptions)
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
