/**
 * @fileoverview Tests for TSX-specific constructs
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import { readFileSync } from 'fs';
import glob from 'glob';
import { extname } from 'path';
import { ParserOptions } from '../../src/parser-options';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
  isJSXFileType
} from '../../tools/test-utils';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/tsx';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.tsx`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('TSX', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    const fileExtension = extname(filename);
    const config: ParserOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      useJSXTextNode: true,
      jsx: isJSXFileType(fileExtension)
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR, fileExtension),
      createSnapshotTestBlock(code, config)
    );
  });
});
