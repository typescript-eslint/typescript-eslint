/**
 * @fileoverview Tests for ECMA feature flags
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

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/javascript';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.js`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('javascript', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    const config: ParserOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR),
      createSnapshotTestBlock(code, config)
    );
  });
});
