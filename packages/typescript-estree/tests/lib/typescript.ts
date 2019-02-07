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
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/typescript';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.ts`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('typescript', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    const fileExtension = extname(filename);
    const config: ParserOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      jsx: isJSXFileType(fileExtension)
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR, fileExtension),
      createSnapshotTestBlock(code, config)
    );
  });
});
