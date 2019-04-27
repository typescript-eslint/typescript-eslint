import { readFileSync } from 'fs';
import glob from 'glob';
import { TSEStreeOptions } from '../../src/parser-options';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
} from '../../tools/test-utils';

const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures/javascript';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.js`);

describe('javascript', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    const config: TSEStreeOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR),
      createSnapshotTestBlock(code, config),
    );
  });
});
