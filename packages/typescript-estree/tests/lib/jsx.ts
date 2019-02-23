import { readFileSync } from 'fs';
import glob from 'glob';
import { ParserOptions } from '../../src/parser-options';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
} from '../../tools/test-utils';
import filesWithKnownIssues from '../../../shared-fixtures/jsx-known-issues';

const JSX_FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/jsx';
const jsxTestFiles = glob
  .sync(`${JSX_FIXTURES_DIR}/**/*.src.js`)
  .filter(filename =>
    filesWithKnownIssues.every(fileName => !filename.includes(fileName)),
  );

const JSX_JSXTEXT_FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/jsx-useJSXTextNode';
const jsxTextTestFiles = glob.sync(`${JSX_JSXTEXT_FIXTURES_DIR}/**/*.src.js`);

describe('JSX', () => {
  /**
   * Test each fixture file
   */
  function testFixture(
    fixturesDir: string,
    useJSXTextNode: boolean,
  ): (filename: string) => void {
    return filename => {
      const code = readFileSync(filename, 'utf8');
      const config: ParserOptions = {
        loc: true,
        range: true,
        tokens: true,
        errorOnUnknownASTType: true,
        useJSXTextNode,
        jsx: true,
      };
      it(
        formatSnapshotName(filename, fixturesDir),
        createSnapshotTestBlock(code, config),
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
