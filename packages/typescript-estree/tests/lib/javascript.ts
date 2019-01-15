/**
 * @fileoverview Tests for ECMA feature flags
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
  'node_modules/@typescript-eslint/shared-fixtures/fixtures/javascript';

const testFiles = shelljs
  .find(FIXTURES_DIR)
  .filter(filename => filename.indexOf('.src.js') > -1)
  // strip off ".src.js"
  .map(filename =>
    filename.substring(FIXTURES_DIR.length + 1, filename.length - 7)
  );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('javascript', () => {
  testFiles.forEach(filename => {
    const code = shelljs.cat(`${path.resolve(FIXTURES_DIR, filename)}.src.js`),
      config = {
        loc: true,
        range: true,
        tokens: true,
        errorOnUnknownASTType: true
      };

    it(
      `fixtures/${filename}.src`,
      createSnapshotTestBlock(code, config as ParserOptions)
    );
  });
});
