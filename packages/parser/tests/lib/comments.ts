import fs from 'fs';
import glob from 'glob';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
} from '../tools/test-utils';
import { ParserOptions } from '../../src/parser-options';

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/comments';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.js`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('Comments', () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    const config: ParserOptions = {
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR),
      createSnapshotTestBlock(code, config),
    );
  });
});
