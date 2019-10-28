import {
  createSnapshotTestBlock,
  isJSXFileType,
} from '@typescript-eslint/shared-fixtures/dist/test-utils';
import fs from 'fs';
import path from 'path';
import { parse, TSESTreeOptions } from '../../src/parser';

function readParseAndSnapshot<TOptions, TReturn>(
  fixturePath: string,
  options: Partial<TOptions>,
  parse: (code: string, config: TOptions) => TReturn,
): void {
  const code = fs.readFileSync(fixturePath, 'utf8');
  const ext = path.extname(fixturePath);
  const runTest = createSnapshotTestBlock(
    code,
    ({
      ...options,
      comment: true,
      errorOnUnknownASTType: true,
      jsx: isJSXFileType(ext),
      tokens: true,
    } as unknown) as TOptions,
    parse,
  );

  runTest();
}

function testWithLocation(
  fixturePath: string,
  options: Partial<TSESTreeOptions>,
): void {
  describe(fixturePath, () => {
    it(`parses with location information`, () => {
      readParseAndSnapshot(
        fixturePath,
        {
          ...options,
          loc: true,
          range: true,
        },
        parse,
      );
    });
  });
}

function testWithoutLocation(
  fixturePath: string,
  options: Partial<TSESTreeOptions>,
): void {
  describe(fixturePath, () => {
    it(`parses without location information`, () => {
      readParseAndSnapshot(
        fixturePath,
        {
          ...options,
          loc: false,
          range: false,
        },
        parse,
      );
    });
  });
}

export { testWithLocation, testWithoutLocation };
