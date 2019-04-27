import { readFileSync } from 'fs';
import glob from 'glob';
import { extname } from 'path';
import { TSEStreeOptions } from '../../src/parser-options';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
  isJSXFileType,
} from '../../tools/test-utils';

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/tsx';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.tsx`);

describe('TSX', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    const fileExtension = extname(filename);
    const config: TSEStreeOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      useJSXTextNode: true,
      jsx: isJSXFileType(fileExtension),
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR, fileExtension),
      createSnapshotTestBlock(code, config),
    );
  });
});
