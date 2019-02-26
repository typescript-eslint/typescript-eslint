import fs from 'fs';
import path from 'path';
import { createScopeSnapshotTestBlock } from '../tools/test-utils';

describe('TypeScript scope analysis', () => {
  const fixturesDir = 'tests/fixtures/scope-analysis';
  const files = fs
    .readdirSync(fixturesDir)
    .map(filename => path.join(fixturesDir, filename).replace(/\\/g, '/'));

  describe('sourceType: module', () => {
    for (const filePath of files) {
      const code = fs.readFileSync(filePath, 'utf8');
      it(
        filePath,
        createScopeSnapshotTestBlock(code, {
          loc: true,
          range: true,
          tokens: true,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: path.extname(filePath) === '.tsx',
          },
        }),
      );
    }
  });

  describe('sourceType: script', () => {
    for (const filePath of files) {
      const code = fs.readFileSync(filePath, 'utf8');

      it(
        filePath,
        createScopeSnapshotTestBlock(code, {
          loc: true,
          range: true,
          tokens: true,
          sourceType: 'script',
          ecmaFeatures: {
            jsx: path.extname(filePath) === '.tsx',
          },
        }),
      );
    }
  });
});
