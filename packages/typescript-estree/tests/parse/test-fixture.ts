import fs from 'fs';
import path from 'path';
import { TSESTreeOptions } from '../../src/parser';
import { createSnapshotTestBlock, isJSXFileType } from '../../tools/test-utils';

function readParseAndSnapshot(
  fixturePath: string,
  options: Partial<TSESTreeOptions>,
): void {
  const code = fs.readFileSync(fixturePath, 'utf8');
  const ext = path.extname(fixturePath);
  const runTest = createSnapshotTestBlock(code, {
    ...options,
    comment: true,
    errorOnUnknownASTType: true,
    jsx: isJSXFileType(ext),
    tokens: true,
  });

  runTest();
}

function testWithLocation(
  fixturePath: string,
  options: Partial<TSESTreeOptions>,
): void {
  describe(fixturePath, () => {
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
  options: Partial<TSESTreeOptions>,
): void {
  describe(fixturePath, () => {
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
