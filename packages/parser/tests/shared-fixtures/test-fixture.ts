import { isJSXFileType } from '@typescript-eslint/shared-fixtures/dist/test-utils';
import fs from 'fs';
import path from 'path';
import { ParserOptions } from '../../src/parser';
import { createScopeSnapshotTestBlock } from '../../tests/tools/test-utils';

function readParseAndSnapshot(
  fixturePath: string,
  options: Partial<ParserOptions>,
): void {
  const code = fs.readFileSync(fixturePath, 'utf8');
  const ext = path.extname(fixturePath);
  const runTest = createScopeSnapshotTestBlock(code, {
    ...options,
    comment: true,
    errorOnUnknownASTType: true,
    ecmaFeatures: {
      jsx: isJSXFileType(ext),
    },
    tokens: true,
  });

  runTest();
}

function testWithLocation(
  fixturePath: string,
  options: Partial<ParserOptions>,
): void {
  describe(path.relative(process.cwd(), fixturePath), () => {
    it(`parses with location information`, () => {
      readParseAndSnapshot(fixturePath, {
        ...options,
        loc: true,
        range: true,
      });
    });
  });
}

function testWithoutLocation(
  fixturePath: string,
  options: Partial<ParserOptions>,
): void {
  describe(path.relative(process.cwd(), fixturePath), () => {
    it(`parses without location information`, () => {
      readParseAndSnapshot(fixturePath, {
        ...options,
        loc: false,
        range: false,
      });
    });
  });
}

export { testWithLocation, testWithoutLocation };
