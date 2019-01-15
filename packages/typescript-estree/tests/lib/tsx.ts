/**
 * @fileoverview Tests for TSX-specific constructs
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

const TSX_FIXTURES_DIR =
  'node_modules/@typescript-eslint/shared-fixtures/fixtures/tsx';

const testFiles = shelljs
  .find(TSX_FIXTURES_DIR)
  .filter(filename => filename.indexOf('.src.tsx') > -1)
  // strip off ".src.tsx"
  .map(filename =>
    filename.substring(TSX_FIXTURES_DIR.length + 1, filename.length - 8)
  );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('TSX', () => {
  testFiles.forEach(filename => {
    const code = shelljs.cat(
      `${path.resolve(TSX_FIXTURES_DIR, filename)}.src.tsx`
    );
    const config = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      useJSXTextNode: true,
      jsx: true
    };
    it(
      `fixtures/${filename}.src`,
      createSnapshotTestBlock(code, config as ParserOptions)
    );
  });
});
