import fs from 'fs';
import glob from 'glob';
import {
  createScopeSnapshotTestBlock,
  formatSnapshotName,
} from '../tools/test-utils';

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/typescript';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.ts`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('typescript', () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    it(
      formatSnapshotName(filename, FIXTURES_DIR, '.ts'),
      createScopeSnapshotTestBlock(code),
    );
  });
});
