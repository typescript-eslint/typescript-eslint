import path from 'path';
import fs from 'fs';
import glob from 'glob';
import { ParserOptions } from '../../src/parser';
import {
  createSnapshotTestBlock,
  formatSnapshotName,
  testServices,
} from '../tools/test-utils';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = './tests/fixtures/services';
const testFiles = glob.sync(`**/*.src.ts`, {
  cwd: FIXTURES_DIR,
});

function createConfig(filename: string): ParserOptions {
  return {
    filePath: filename,
    project: './tsconfig.json',
    tsconfigRootDir: path.resolve(FIXTURES_DIR),
  };
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('services', () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
    const config = createConfig(filename);
    it(
      formatSnapshotName(filename, FIXTURES_DIR, '.ts'),
      createSnapshotTestBlock(code, config),
    );
    it(`${formatSnapshotName(filename, FIXTURES_DIR, '.ts')} services`, () => {
      testServices(code, config);
    });
  });
});
