import fs from 'fs';
import glob from 'glob';
import * as testUtils from '../../tools/test-utils';

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/comments';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.js`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('Comments', () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    const config = {
      jsx: true,
      sourceType: 'module'
    };
    it(
      testUtils.formatSnapshotName(filename, FIXTURES_DIR),
      testUtils.createSnapshotTestBlock(code, config)
    );
  });
});
