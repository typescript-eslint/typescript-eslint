import fs from 'fs';
import glob from 'glob';
import filesWithKnownIssues from '../../../shared-fixtures/jsx-known-issues';
import * as testUtils from '../../tools/test-utils';

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
  function testFixture(fixturesDir: string, useJSXTextNode: boolean) {
    return (filename: string) => {
      const code = fs.readFileSync(filename, 'utf8');
      const config = {
        useJSXTextNode,
        jsx: true
      };
      it(
        testUtils.formatSnapshotName(filename, fixturesDir),
        testUtils.createSnapshotTestBlock(code, config)
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
