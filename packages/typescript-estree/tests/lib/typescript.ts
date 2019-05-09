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
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/typescript';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.ts`);

describe('typescript', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    const fileExtension = extname(filename);
    const config: TSESTreeOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      jsx: isJSXFileType(fileExtension),
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR, fileExtension),
      createSnapshotTestBlock(code, config),
    );
  });
});
