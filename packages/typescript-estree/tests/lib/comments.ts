import { readFileSync } from 'fs';
import glob from 'glob';
import { extname } from 'path';
import { TSESTreeOptions } from '../../src/parser-options';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
  isJSXFileType,
} from '../../tools/test-utils';

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/comments';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.*`);

describe('Comments', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    const fileExtension = extname(filename);
    const config: TSESTreeOptions = {
      loc: true,
      range: true,
      tokens: true,
      comment: true,
      jsx: isJSXFileType(fileExtension),
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR, fileExtension),
      createSnapshotTestBlock(code, config),
    );
  });
});
