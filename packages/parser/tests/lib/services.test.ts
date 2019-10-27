import {
  createSnapshotTestBlock,
  formatSnapshotName,
} from '@typescript-eslint/shared-fixtures/dist/test-utils';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import { parse, parseForESLint, ParserOptions } from '../../src/parser';
import { defaultConfig } from '../../tests/tools/test-utils';

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
    tsconfigRootDir: path.resolve(FIXTURES_DIR),
  };
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

function testServices(code: string, config: ParserOptions = {}): void {
  config = Object.assign({}, defaultConfig, config);

  const services = parseForESLint(code, config).services;
  expect(services).toBeDefined();
  expect(services.program).toBeDefined();
  expect(services.esTreeNodeToTSNodeMap).toBeDefined();
  expect(services.tsNodeToESTreeNodeMap).toBeDefined();
}

describe('services', () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    const config = createConfig(filename);
    it(
      formatSnapshotName(filename, FIXTURES_DIR, '.ts'),
      createSnapshotTestBlock(code, config, parse),
    );
    it(`${formatSnapshotName(filename, FIXTURES_DIR, '.ts')} services`, () => {
      testServices(code, config);
    });
  });
});
