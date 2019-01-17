import path from 'path';
import fs from 'fs';
import glob from 'glob';
import * as testUtils from '../../tools/test-utils';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = './tests/fixtures/services';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.ts`);

function createConfig(filename: string): object {
  return {
    filePath: filename,
    generateServices: true,
    project: './tsconfig.json',
    tsconfigRootDir: path.resolve(FIXTURES_DIR)
  };
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('services', () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    const config = createConfig(filename);
    it(
      testUtils.formatSnapshotName(filename, FIXTURES_DIR, '.ts'),
      testUtils.createSnapshotTestBlock(code, config)
    );
    it(`${testUtils.formatSnapshotName(
      filename,
      FIXTURES_DIR,
      '.ts'
    )} services`, () => {
      testUtils.testServices(code, config);
    });
  });
});
