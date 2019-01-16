import fs from 'fs';
import glob from 'glob';
import testUtils from '../../tools/test-utils';

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
      testUtils.formatSnapshotName(filename, FIXTURES_DIR, '.ts'),
      testUtils.createSnapshotTestBlock(code)
    );
  });
});
