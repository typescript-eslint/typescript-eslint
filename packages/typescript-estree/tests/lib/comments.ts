/**
 * @fileoverview Tests for parsing and attaching comments.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import path from 'path';
import shelljs from 'shelljs';
import { ParserOptions } from '../../src/temp-types-based-on-js-source';
import { createSnapshotTestBlock } from '../../tools/test-utils';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR =
  'node_modules/@typescript-eslint/shared-fixtures/fixtures/comments';

const testFiles = shelljs
  .find(FIXTURES_DIR)
  .filter(
    filename =>
      filename.indexOf('.src.js') > -1 || filename.indexOf('.src.ts') > -1
  );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('Comments', () => {
  testFiles.forEach(filename => {
    const code = shelljs.cat(path.resolve(filename));
    const config: ParserOptions = {
      loc: true,
      range: true,
      tokens: true,
      comment: true,
      jsx: path.extname(filename) === '.js'
    };
    // strip off ".src.js" and ".src.ts"
    const name = filename.substring(
      FIXTURES_DIR.length + 1,
      filename.length - 7
    );
    it(`fixtures/${name}.src`, createSnapshotTestBlock(code, config));
  });
});
